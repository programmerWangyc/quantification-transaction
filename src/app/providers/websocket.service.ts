import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/share';

import { Injectable } from '@angular/core';
import { QueueingSubject } from 'queueing-subject';
import websocketConnect, { IWebSocket } from 'rxjs-websockets';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { LocalStorageKey } from './../interfaces/constant.interface';
import { WsRequest } from './../interfaces/request.interface';
import { ResponseBody } from './../interfaces/response.interface';
import { TipService } from './tip.service';

export interface CustomEvent {
    data: ArrayBuffer;
}

export const Buffer = require('buffer').Buffer;

export const LZ4 = require('lz4');

@Injectable()
export class WebsocketService {

    private url = `wss://www.botvs.com/ws_botvs_v1`;

    private inputStream: QueueingSubject<ArrayBuffer> = new QueueingSubject();

    public messages: Observable<ResponseBody>;

    private connectionStatus: Observable<number>

    private connectionStatusSubscription: Subscription;

    private msgSubscription: Subscription;

    private version = 3.5;

    constructor(private tip: TipService) {
        this.connect();
    }

    send(data: WsRequest): Observable<ResponseBody> {
        
        const param = {
            method: data.method,
            params: data.params,
            token: localStorage.getItem(LocalStorageKey.token),
            version: this.version,
            callbackId: data.method.join('-')
        }

        const request = this.deflate(param);

        // console.log(param);
        this.inputStream.next(request);

        return this.messages.filter(data => data.callbackId === param.callbackId);
    }

    connect(): void {
        if (this.messages) return;

        const webSocketFactory: (a: string, b: string | string[]) => IWebSocket = (url: string, protocols: string | string[]) => {
            const ws = new WebSocket(url, protocols);

            ws.binaryType = 'arraybuffer';

            return ws;
        }

        const { messages, connectionStatus } = websocketConnect(this.url, this.inputStream, [], webSocketFactory);

        this.messages = messages
            .map(msg => this.unfold(msg))
            .filter(response => response !== 'P')
            .map(response => JSON.parse(response) as ResponseBody)
            .do(v => console.log(v))
            .retryWhen(errors => errors.do(_ => this.tip.showTip('网络错误')).delay(2000))
            .share();

        this.connectionStatus = connectionStatus;

        this.connectionStatusSubscription = connectionStatus.subscribe(numberConnected => {
            console.log('current websocket status: ', numberConnected);
        });

        /**
         * @description The messages flow is 'HOT', so refCount keep on it, it would be release current resource as soon as the refCount is equals to zero.
         * When next subscription come, the websocket instance would be re-initialized. So in order to prevent duplicate websocket instance object, we need
         * to keep at least one observer on this stream, the observer is the publicEffect observer provided by ngrx library. If no one plays this role, please
         * de-comment the code blow.
         */
        // this.msgSubscription = this.messages.subscribe(() => {});
    }

    deflate(source: Object): ArrayBuffer {
        const data = JSON.stringify(source);

        const input: Buffer = new Buffer(data);

        const output: Buffer = new Buffer(LZ4.encodeBound(input.length));

        const compressedSize: number = LZ4.encodeBlock(input, output);

        let buf = null;

        if (compressedSize > 0 && compressedSize < input.length) {
            buf = new Buffer(8 + compressedSize);
            buf.writeUInt32LE(0x184D2204);
            buf.writeUInt32LE(input.length, 4);
            for (var i = 0; i < output.length; i++) {
                buf[i + 8] = output[i];
            }
        } else {
            buf = new Buffer(8 + input.length);
            buf.writeUInt32LE(0x184D2204);
            buf.writeUInt32LE(0, 4);
            buf.write(data, 8);
        }

        return buf;
    }

    unfold(data: ArrayBuffer | string): string {
        const input: Buffer = new Buffer(data);

        if (input.readUInt32LE(0) != 0x184D2204) {
            console.log("invalid lz4 format");
            return '';
        }

        const rawLen = input.readUInt32LE(4);

        const rawInput = new Buffer(data.slice(8));

        if (rawLen === 0) {
            return rawInput.toString();
        }

        const output = new Buffer(rawLen);

        LZ4.decodeBlock(rawInput, output);

        return output.toString();
    }
}

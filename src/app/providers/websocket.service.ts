import { Injectable } from '@angular/core';

import { QueueingSubject } from 'queueing-subject/lib';
import { Observable } from 'rxjs';
import websocketConnect, { IWebSocket } from 'rxjs-websockets/lib';
import { delay, filter, map, retryWhen, share, tap } from 'rxjs/operators';

import { LocalStorageKey } from '../app.config';
import { WsRequest } from '../interfaces/request.interface';
import { ResponseBody } from '../interfaces/response.interface';
import { ConstantService } from './constant.service';
import { TipService } from './tip.service';

export interface CustomEvent {
    data: ArrayBuffer;
}

declare var requireX: any;

const Buffer = requireX('buffer').Buffer;

const LZ4 = requireX('lz4');

@Injectable()
export class WebsocketService {

    private url = `wss://www.fmz.com/ws_botvs_v1`;

    private inputStream: QueueingSubject<ArrayBuffer> = new QueueingSubject();

    public messages: Observable<ResponseBody>;

    constructor(
        private tip: TipService,
        private constant: ConstantService
    ) {
        this.connect();
    }

    send(request: WsRequest): Observable<ResponseBody> {

        const param = {
            method: request.method,
            params: request.params,
            token: localStorage.getItem(LocalStorageKey.token),
            version: this.constant.VERSION,
            callbackId: request.callbackId,
        };

        const info = this.deflate(param);

        this.inputStream.next(info);

        return this.messages.pipe(filter(data => data.callbackId === param.callbackId));
    }

    connect(): void {
        if (this.messages) return;

        const webSocketFactory: (a: string, b: string | string[]) => IWebSocket = (url: string, protocols: string | string[]) => {
            const ws = new WebSocket(url, protocols);

            ws.binaryType = 'arraybuffer';

            return ws;
        };

        const { messages, connectionStatus } = websocketConnect(this.url, this.inputStream, [], webSocketFactory);

        this.messages = messages
            .pipe(
                map(msg => this.unfold(msg)),
                filter(response => response !== 'P'),
                map(response => JSON.parse(response) as ResponseBody),
                retryWhen(errors => errors
                    .pipe(
                        tap(_ => this.tip.messageError('NETWORK_DISCONNECTED')),
                        delay(5000),
                        tap(_ => this.tip.messageInfo('RECONNECTING'))
                    )
                ),
                share()
            );

        connectionStatus.subscribe(numberConnected => {
            console.log('current websocket status: ', numberConnected);
            numberConnected && this.tip.messageSuccess('NETWORK_CONNECTED');
        });

        this.messages.subscribe(() => { });
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
            for (let i = 0; i < output.length; i++) {
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

        if (input.readUInt32LE(0) !== 0x184D2204) {
            console.log('invalid lz4 format');
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

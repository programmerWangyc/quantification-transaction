import { Injectable } from '@angular/core';

@Injectable()
export class SimulationSocketService {

    // private url = `wss://www.fmz.com/ws_botvs_sandbox`;

    // private inputStream: QueueingSubject<ArrayBuffer> = new QueueingSubject();

    // public messages: Observable<ResponseBody>;

    constructor(
        // private tip: TipService,
    ) {
        // this.connect();
    }

    // send(request: WsRequest): Observable<ResponseBody> {

        // const param = {
        //     method: request.method,
        //     params: request.params,
        //     token: localStorage.getItem(LocalStorageKey.token),
        //     version: this.constant.VERSION,
        //     callbackId: request.callbackId,
        // };

        // const info = this.deflate(param);

        // // console.log(param);
        // this.inputStream.next(info);

        // return this.messages.pipe(filter(data => data.callbackId === param.callbackId));
    // }

    // connect(): void {
    //     if (this.messages) return;

    //     const webSocketFactory: (a: string, b: string | string[]) => IWebSocket = (url: string, protocols: string | string[]) => {
    //         const ws = new WebSocket(url, protocols);

    //         ws.binaryType = 'arraybuffer';

    //         return ws;
    //     };

    //     const { messages, connectionStatus } = websocketConnect(this.url, this.inputStream, [], webSocketFactory);

    //     this.messages = messages
    //         .pipe(
                // map(msg => this.unfold(msg)),
                // // .do(msg => console.log('Websocket get message: ', JSON.parse(msg)))
                // filter(response => response !== 'P'),
                // map(response => JSON.parse(response) as ResponseBody),
                // retryWhen(errors => errors
                //     .pipe(
                //         tap(_ => this.tip.messageError('NETWORK_DISCONNECTED')),
                //         delay(5000),
                //         tap(_ => this.tip.messageInfo('RECONNECTING'))
                //     )
                // ),
                // share()
            // );

        // this.connectionStatus = connectionStatus;

        // connectionStatus.subscribe(numberConnected => {
        //     console.log('current websocket status: ', numberConnected);
        //     numberConnected && this.tip.messageSuccess('NETWORK_CONNECTED');
        // });

        /**
         * The messages flow is 'HOT', so refCount keep on it, it would be release current resource as soon as the refCount is equals to zero.
         * When next subscription come, the websocket instance would be re-initialized. So in order to prevent duplicate websocket instance object, we need
         * to keep at least one observer on this stream, the observer is the publicEffect observer provided by ngrx library. If no one plays this role, please
         * de-comment the code blow.
         */
        // this.messages.subscribe(() => { });
    // }
}

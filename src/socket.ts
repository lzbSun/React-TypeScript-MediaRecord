import io from 'socket.io-client'

type emitDate = {
    data: any
    type: 'wav' | 'webm'
}

export type chunkData = {
    speed: string
    channel: string
    code: string
}

const socketOptions = {
    transports: ['websocket'],
    rejectUnauthorized: false,
    reconnection: true,
    reconnectionDelay: 20000,
    reconnectionDelayMax: 20000,
    reconnectionAttempts: 3,
    secure: false,
    autoConnect: true,
}

export default class Socket {
    private socketIO: any
    public channelID: string

    constructor() {
        this.channelID = ''
        // 设置socket地址，获取语速信息
        this.socketIO = io('ws://test.speed.com:9008', socketOptions)
        this.socketIO.on('connect', () => {
            this.channelID = this.socketIO.id
        })
    }

    emit = (data: emitDate) => {
        this.socketIO.emit('chunk', {...data, channelID: this.channelID})
    }

    listen = (fun: (data: chunkData) => {}) => {
        this.socketIO.on('speed', (data: chunkData) => {
            fun && fun(data)
        })
    }
}

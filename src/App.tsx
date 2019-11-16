import React from 'react';
import './App.css';
import WaveSurfer from 'wavesurfer.js'
import WaveSurferMicroPhone from 'wavesurfer.js/dist/plugin/wavesurfer.microphone.js'
import { Button, Row, Col, message, Switch, InputNumber } from 'antd'
import RecordItem from './recordItem'
import { timerDuring } from './constants'
import DragArea from './DragArea'
import uuidv1 from 'uuid/v1'

type recordItem = {
  blob: Blob | null,
}

// const initialSpeedData = [100, 200, 299, 199, 300, 455, 678]


const initialState: {recordList: recordItem[], 
                     recordStatus: boolean, 
                     audioReady: boolean,
                     speedData: number[],
                     percent: number,
                     recordListEnable: boolean,
                     microphone: boolean,
                     disableMicrophone: boolean,
                     disableMusic: boolean,
                     timerStatus: boolean
                     } = 
                     { recordList: [], recordStatus: false, audioReady: false, speedData: [], percent: 0, recordListEnable: false, microphone: false, disableMusic: true, disableMicrophone: false, timerStatus: false }
type State = Readonly<typeof initialState>

class App extends React.Component<Object, State> {
  
  // private socket: any
  private mediaRecorder: any
  private blobData: Blob | null
  private audioSource: string
  private waveSurfer: any
  private audioRef: React.RefObject<HTMLAudioElement>
  private timer: any = null
  private timerDr: number = timerDuring
  readonly state: State = initialState
  private constraints: any = { audio: true }

  constructor(props: any) {
    super(props)
    this.blobData = null
    this.audioSource = ''
    this.audioRef = React.createRef<HTMLAudioElement>()
  }
  // 初始化 mediaRecorder
  initMediaRecorder = (stream: any, fn?: Function) => {
    this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    this.mediaRecorder.onstop = (e: any) => {
      this.mediaRecordStop()
    }
    this.mediaRecorder.ondataavailable = (e:any) => {
      this.blobData = e.data
    }
    fn && fn()
  }

  intervalRecordStack = () => {
    this.timer = setInterval(() => {
      this.endRecord(this.startRecord)
      this.setState({
        timerStatus: true
      })
    }, this.timerDr * 1000)
  }

  stopIntervalRecordStack = () => {
    clearInterval(this.timer)
    this.timer = null
    this.setState({
      timerStatus: false
    })
  }

  setSource = (source: File | Blob) => {
    const fileReader = new FileReader()

    fileReader.addEventListener('load', (res) => {
      this.setState({
        audioReady: false
      }, () => {
        this.initWaveSurfer()
        if (fileReader.result) {
          this.waveSurfer.load(fileReader.result);
          this.audioSource = fileReader.result as string
        }
        
        console.log(this.waveSurfer.backend) 
      })
    })
    fileReader.readAsDataURL(source)
  }

  listenCallback = () => {
    let item: recordItem = {blob: this.blobData}

    let { recordList, speedData } = this.state
    const blobDataArray = recordList.concat([])
    
    this.blobData && blobDataArray.push(item)
    this.setState({
      recordList: blobDataArray,
      speedData
    }) 
  }

  mediaRecordStop = () => {
    // const fileReader = new FileReader()
    
    // this.blobData && fileReader.readAsDataURL(this.blobData)

    // fileReader.onload = () => {
    //   let base64 = fileReader.result
    //   if (base64 && typeof base64 === 'string') {
    //       base64 = base64.slice(base64.indexOf(',') + 1) 
    //   } 
    //   // if (this.socket.channelID) {
    //   //   this.chunkCallback({type: 'webm', data: base64})
    //   // } else {
    //   //   console.warn('socket is not ready')
    //   // }
    // }
    this.listenCallback()
  }

  startRecord = (fn?: Function) => {
    if (!this.state.recordStatus) {
      this.mediaRecorder.start()
      this.setState({ recordStatus: true },
        () => {
          fn && fn()
        })
    }
  }

  endRecord = (fn?: Function) => {
    if (this.state.recordStatus){
      this.blobData = null
      this.mediaRecorder.stop()
      this.setState({ recordStatus: false }, () => {
        fn && fn()
      })
    }
  }

  handleStartRecord = () => {
   this.startRecord(this.intervalRecordStack)
  }
  handleEndRecord = () => {
    this.endRecord(this.stopIntervalRecordStack)
  }

  initWaveSurfer = (source?: Blob) => {
    if (this.waveSurfer) {
      this.waveSurfer.destroy()
    }
    this.waveSurfer = WaveSurfer.create({
      container:'#class-mp3',
      waveColor: '#7cb5ec',
      progressColor: '#1890ff',
      scrollParent: true,
      backend: 'MediaElement'
    });
    this.waveSurferEvents()

  }

  waveSurferEvents = () => {
    this.waveSurfer.on('loading', (percent: number) => {
      this.setState({ percent })
    });
    this.waveSurfer.on('ready', () => {
      this.setState({ audioReady: true, disableMusic: false })
      this.initMediaRecorder(this.waveSurfer.backend.media.captureStream())
    });
    this.waveSurfer.on('error', function(e:any) {
      console.warn(e);
    });
    this.waveSurfer.on('finish', () => {
      this.handleEndRecord()
    })
  }

  initWaveSurferWithMicrophone = () => {
    if (this.waveSurfer) {
      this.waveSurfer.destroy()
    }
    this.waveSurfer = WaveSurfer.create({
      container:'#class-mp3',
      waveColor: '#7cb5ec',
      progressColor: '#1890ff',
      cursorWidth: 0,
      plugins: [
        WaveSurferMicroPhone.create({
          constraints: {
              video: false,
              audio: true
          }
        })
      ]
    });

    this.waveSurfer.on('loading', (percent: number) => {
      console.log(`loading${percent}`)
    });
    this.waveSurfer.on('ready', () => {
      console.log('ready')
      // this.setState({ audioReady: true })
    });
    this.waveSurfer.on('error', function(e:any) {
      console.warn(e);
    });
    this.waveSurfer.on('finish', () => {
      console.log('finish')
    })
    this.waveSurfer.microphone.on('deviceReady', (stream: any) => {
      console.log('Device ready!', stream);
      this.waveSurfer.toggleMute()
      this.initMediaRecorder(stream)
      this.handleStartRecord()
    });
    this.waveSurfer.microphone.on('deviceError', function(code: any) {
        console.warn('Device error: ' + code);
    });
    this.waveSurfer.microphone.start()
  }
  handleMicrophone = () => {
    this.setState({
      microphone: true,
      disableMusic: true
    }, () => {
      this.initWaveSurferWithMicrophone()
    })
    // this.waveSurfer.toggleMute()
  }

  handleMicrophoneStop = () => {
    this.setState({
      microphone: false,
      disableMusic: false
    }, () => {
      this.waveSurfer.microphone.stop();
      this.handleEndRecord()
      // 如果有source 那么初始化
      if (!!this.audioSource) {
        this.initWaveSurfer()
        this.waveSurfer.load(this.audioSource);
      }
    })
  }


  startPlayAudio = () => {
    this.waveSurfer.playPause()
    if(this.waveSurfer.isPlaying()) {
      this.setState({
        disableMicrophone: true
      }, () => {
        this.handleStartRecord() // 开始录制
      })
    } else {
      this.setState({
        disableMicrophone: false
      }, () => {
        this.handleEndRecord()
      })
    }
    if (this.waveSurfer.getMute()) {
      this.waveSurfer.setMute(false)
    }
  }

  handleSwitch = (checked: boolean, event: Event) => {
    this.setState({
      recordListEnable: checked
    })
  }

  handleDownLoad = () => {
    if(!this.state.speedData.length) {
      message.warning('无数据，请先录制数据');
      return 
    }
    this.handleEndRecord()
    let data = this.state.speedData.map((number, index) => {
      return {time: `${(index + 1) * timerDuring / 1000}s`, speed: number }
    })
    let blob = new Blob([JSON.stringify(data)], {type : 'application/json'})
    let url = URL.createObjectURL(blob)
    let a = document.createElement('a')
    a.href = url
    a.download = `speed-${uuidv1()}`
    a.click()
    window.open(url, '_blank')
  }

  handleTimeDurChange = (value: any) => {
    if (typeof value === 'number')  {
      this.timerDr = value
    } else {
      this.timerDr = timerDuring
    }
  }
  

  renderRecorderList = () => {
    const { recordList } = this.state
    let resetRecordList:any[] = []
    let initList:any[] = []
    if (Boolean(recordList.length)) {
      recordList.reduce((pre, next, number) => {
        if (number === recordList.length - 1) {
          if (!Boolean(number % 3)) {
            Boolean(pre.length) && resetRecordList.push(pre)
            pre = []
          } 
          pre.push(<Col span={8} key={`item2${number}`}><RecordItem blob={next.blob} /></Col>)  
          resetRecordList.push(pre)
          
          return []
        }

        if (!Boolean(number % 3)) {
          Boolean(pre.length) && resetRecordList.push(pre)
          pre = []
        }

        pre.push(<Col span={8} key={`item2${number}`}><RecordItem blob={next.blob}/></Col>)
       
        return pre
      }, initList)
      return resetRecordList.map((ResetRecordItem, i) => <Row key={i} type="flex" align="middle">{ResetRecordItem}</Row>)
    }
    return null
  }

  

  render() {
    const { recordStatus, speedData, audioReady, recordListEnable, microphone, disableMusic, disableMicrophone, timerStatus } = this.state
    return (
      <div className="App">
          <div id='class-mp3'>
            {/* {!audioReady && <Progress percent={percent} showInfo={false} status="active" />} */}
          </div>
          <DragArea setSourceBlob={this.setSource}/>

          <div className='operate-area'>
            录音间隔时间 / s： <InputNumber min={3} max={timerDuring} className='operate-btn' disabled={timerStatus} defaultValue={this.timerDr} onChange={this.handleTimeDurChange}/>
            <Button type='primary' className='operate-btn' disabled={microphone || disableMicrophone} onClick={this.handleMicrophone}> microphone </Button>
            <Button type='primary' className='operate-btn' disabled={!microphone || disableMicrophone} onClick={this.handleMicrophoneStop}> microphone stop</Button>
            {/* <Button type="ghost" className='operate-btn' disabled={!audioReady || recordStatus} onClick={this.handleStartRecord}>录制</Button>
            <Button type="ghost" className='operate-btn' disabled={!recordStatus} onClick={this.handleEndRecord}>停止</Button> */}
            <Button type='primary' className={`operate-btn ${disableMusic ? 'disableBtn' : '' }`} disabled={!audioReady} onClick={this.startPlayAudio}>play / pause music</Button>
            <div className={`operate-btn recordBlock ${recordStatus ? 'recording' : ''}`}></div>
            <span className="operate-btn">
              Record list <Switch checkedChildren="开" unCheckedChildren="关" onChange={this.handleSwitch}/>
            </span>
            {/* <Button type="primary" className='operate-btn' disabled={recordStatus} icon="download" onClick={this.handleDownLoad}>下载 speed 数据</Button> */}
          </div>
          <div className='recorder-container'>
            {
              recordListEnable && this.renderRecorderList() ? 
              <>
                <h2>record 列表</h2>
                {this.renderRecorderList()}
              </> :
              null
            }
          </div>
          {/* <Charts data={speedData}/> */}
      </div>
    );
  }
}


export default App;

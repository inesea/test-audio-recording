/* eslint-disable no-unused-vars */
import MicrophoneStream from 'microphone-stream'
import React, { useState } from 'react'
import './App.css'
import * as Styled from './App.style'

function App() {
  const [micStream, setMicStream] = useState()
  const [isRecording, setRecording] = useState(false)
  const [resultData, setResultData] = useState()
  const [audioBuffer] = React.useState(
    (function () {
      let buffer = []
      function add(raw) {
        buffer = buffer.concat(...raw)
        return buffer
      }
      function newBuffer() {
        console.log('resetting buffer')
        buffer = []
      }

      return {
        reset: function () {
          newBuffer()
        },
        addData: function (raw) {
          return add(raw)
        },
        getData: function () {
          return buffer
        },
      }
    })()
  )

  const handleStartRecording = () => {
    audioBuffer.reset()
    setResultData(null)

    console.log('started', { micStream, data: audioBuffer.getData() })

    window.navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        const startMic = new MicrophoneStream()
        startMic.setStream(stream)
        startMic.on('data', (chunk) => {
          const raw = MicrophoneStream.toRaw(chunk)
          if (raw == null) {
            return
          }
          audioBuffer.addData(raw)
        })
        setRecording(true)
        setMicStream(startMic)
      })
  }

  const handleStopRecording = () => {
    setRecording(false)
    if (micStream) {
      micStream.stop()
    }

    const resultArray = audioBuffer.getData()
    setResultData(resultArray)

    console.log('stopped', { micStream, data: resultArray })
  }

  // const handlePlayback = () => {}

  return (
    <div>
      <Styled.Content>
        <Styled.Title>Record audio</Styled.Title>
        <Styled.Row>
          <Styled.Button onClick={handleStartRecording}>Start</Styled.Button>
          <Styled.Button onClick={handleStopRecording}>Stop</Styled.Button>
        </Styled.Row>
        <Styled.RecordingState>{`isRecording: ${isRecording}`}</Styled.RecordingState>
        {/* {resultData && <button onClick={handlePlayback}>Play</button>} */}
      </Styled.Content>
    </div>
  )
}

export default App

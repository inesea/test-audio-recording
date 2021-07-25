/* eslint-disable no-unused-vars */
import MicrophoneStream from 'microphone-stream'
import React, { useEffect, useState } from 'react'
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

  const [audioContext, setAudioContext] = useState()
  useEffect(() => {
    if (!window.AudioContext) {
      if (!window.webkitAudioContext) {
        alert(
          'Your browser does not support any AudioContext and cannot play back this audio.'
        )
        return
      }
      window.AudioContext = window.webkitAudioContext
    }
    setAudioContext(new AudioContext())
  }, [])

  const handlePlayback = () => {
    const sampleRate = 48000
    const numberOfSamples = 88200

    const buffer = audioContext.createBuffer(2, numberOfSamples, sampleRate)
    const buf = buffer.getChannelData(0)
    for (let i = 0; i < resultData.length; ++i) {
      buf[i] = resultData[i]
    }

    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(audioContext.destination)
    source.start(0)
  }

  const handleUploadData = () => {
    fetch('http://locaalhost:3030/api/uploadAaudio', {
      // todo: some server receiving data?
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream', // todo: which content-type?
      },
      body: resultData, // todo: byte array or another data format?
    })
      .then((success) => console.log({ success }))
      .catch((error) => console.log({ error }))
  }

  return (
    <div>
      <Styled.Content>
        <Styled.Title>Record audio</Styled.Title>
        <Styled.Row>
          <Styled.Button onClick={handleStartRecording}>Start</Styled.Button>
          <Styled.Button onClick={handleStopRecording}>Stop</Styled.Button>
        </Styled.Row>
        <Styled.RecordingState>{`isRecording: ${isRecording}`}</Styled.RecordingState>
        {resultData && (
          <Styled.Button onClick={handlePlayback}>Play</Styled.Button>
        )}
        {resultData && (
          <Styled.Button onClick={handleUploadData}>Upload data</Styled.Button>
        )}
      </Styled.Content>
    </div>
  )
}

export default App

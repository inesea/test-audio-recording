/* eslint-disable no-unused-vars */
import MicrophoneStream from 'microphone-stream'
import React, { useEffect, useState } from 'react'
import './App.css'
import * as Styled from './App.style'

function App() {
  const [micStream, setMicStream] = useState()
  const [isRecording, setRecording] = useState(false)
  const [result, setResult] = useState()
  const [audioBuffer] = useState(
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
    setResult({})

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
    if (micStream) {
      micStream.stop()
    }
    setRecording(false)
    setResult({
      byteArray: audioBuffer.getData(),
      time: micStream.audioInput.context.currentTime,
      sampleRate: micStream.audioInput.context.sampleRate,
    })
    console.log('stopped', { micStream, result })
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
    const { byteArray, sampleRate, time } = result
    const length = time * sampleRate
    const buffer = audioContext.createBuffer(2, length, sampleRate)
    const buf = buffer.getChannelData(0)
    for (let i = 0; i < byteArray.length; ++i) {
      buf[i] = byteArray[i]
    }
    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(audioContext.destination)
    source.start(0)
  }

  const handleUploadData = () => {
    // todo: some server receiving data?
    fetch('http://locaalhost:3030/api/uploadAaudio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream', // todo: which content-type?
      },
      body: result.byteArray, // todo: byte array or another data format?
    })
      .then((success) => console.log({ success }))
      .catch((error) => console.log({ error }))
  }

  return (
    <Styled.Content>
      <Styled.Title>Record audio</Styled.Title>
      <Styled.Row>
        <Styled.Button onClick={handleStartRecording}>Start</Styled.Button>
        <Styled.Button onClick={handleStopRecording}>Stop</Styled.Button>
      </Styled.Row>
      <Styled.RecordingState>{`isRecording: ${isRecording}`}</Styled.RecordingState>
      {result && <Styled.Button onClick={handlePlayback}>Play</Styled.Button>}
      {result && (
        <Styled.Button onClick={handleUploadData}>Upload data</Styled.Button>
      )}
    </Styled.Content>
  )
}

export default App

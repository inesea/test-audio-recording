import styled from 'styled-components'

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 20px;
`

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`

export const Title = styled.div`
  padding: 20px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: lightgray;
  width: 100%;
`

export const Button = styled.button`
  padding: 8px;

  background: none;
  color: inherit;
  border: none;
  font: inherit;
  cursor: pointer;
  outline: inherit;

  background-color: lightgrey;
  border-radius: 4px;

  &:hover {
    background-color: lightcoral;
  }
`

export const RecordingState = styled.div`
  padding: 4px;
  border-radius: 4px;
  font-size: 10px;
`

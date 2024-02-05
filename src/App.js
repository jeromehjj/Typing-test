import { useState, useEffect, useRef } from 'react';
import { generate, wordsList, count } from 'random-words'
import * as PhraseGen from 'korean-random-words'
import * as KoreanNounList from 'pd-korean-noun-list-for-wordles'
import { engToKor, korToEng } from 'korean-regexp';

const phraseGen = new PhraseGen()
const NUM_OF_WORDS = 200
const SECONDS = 600


function App() {
  const [words, setWords] = useState([])
  const [countDown, setCountDown] = useState(SECONDS)
  const [currInput, setCurrInput] = useState("")
  const [currWordIndex, setCurrWordIndex] = useState(0)
  const [currCharIndex, setCurrCharIndex] = useState(-1)
  const [currChar, setCurrChar] = useState("")
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [status, setStatus] = useState("waiting")
  const textInput = useRef(null)

  useEffect(() => {
    setWords(generateKoreanWords())
  }, [])

  useEffect(() => {
    if (status === 'started') {
      textInput.current.focus()
    }
  }, [status])

  function generateEnglishWords() {
    return new Array(NUM_OF_WORDS).fill(null).map(() => generate())
  }

  function generateKoreanWords() {
    return new Array(NUM_OF_WORDS).fill(null).map(() => phraseGen.generatePhrase().replace(/-/g, ''))
  }

  function generateKoreanWords2() {
    return new Array(NUM_OF_WORDS).fill(null).map(() => KoreanNounList.ALL_NOUNS)
  }

  function start() {

    if (status === 'finished') {
      setWords(generateKoreanWords())
      setCurrWordIndex(0)
      setCorrect(0)
      setIncorrect(0)
      setCurrCharIndex(-1)
      setCurrChar("")
    }

    if (status !== 'started') {
      setStatus('started')
      let interval = setInterval(() => {
        setCountDown((prevCountDown) => {
          if (prevCountDown === 0) {
            clearInterval(interval)
            setStatus('finished')
            setCurrInput("")
            return SECONDS
          } else {
            return prevCountDown - 1
          }
        })
      } , 1000)
    }
  }

  function checkMatch() {
    const wordToCompare = (words[currWordIndex])
    const doesItMatch = wordToCompare === currInput.trim()
    if (doesItMatch) {
      setCorrect(correct + 1) 
    } else {
      setIncorrect(incorrect + 1)
    }
  }

  function handleKeyDown({keyCode, key}) {
    if (keyCode === 32) { // spacebar
      checkMatch()
      setCurrInput("")
      setCurrWordIndex(currWordIndex + 1)
      setCurrCharIndex(-1)
    } else if (keyCode === 8) { // backspace
      setCurrCharIndex(currCharIndex - 1)
      setCurrChar("")
    } else if (keyCode === 16) {
      // do nothing
    } else {
      setCurrCharIndex(currCharIndex + 1)
      setCurrChar(key)
    }

  }
  
  function getCharClass(wordIndex, charIndex, char) {
    if (wordIndex === currWordIndex && charIndex === currCharIndex && currChar && status !== 'finished') {
      if (char === currChar) {
        return 'has-background-success'
      } else {
        return 'has-background-danger'
      }
    } else if (wordIndex === currWordIndex && currCharIndex >= words[currWordIndex].length) {
      return 'has-background-danger'
    } else {
      return ''
    }
  }
  

  return (
    <div className="App">
      <div className="section">
        <div className="is-size-1 has-text-centered has-text-primary">
          <h2>{countDown}</h2>
        </div>
      </div>
      <div className="control is-expanded-section">
        <input ref={textInput} disabled={status !== "started"} type="text" className="input" onKeyDown={handleKeyDown} value={currInput} onChange={(e) => setCurrInput(e.target.value)}/>
      </div>
      <div className="section">
        <button className="button is-info is-fullwidth" onClick={start}>
          Start
        </button>
      </div>
      {status === 'started' && (
        <div className="section">
        <div className="card">
          <div className="card-content">
            <div className="content">
              {words.map((word, i) => (
                <span key={i}>
                  <span>
                    {word.split("").map((character, index) => (
                      <span className={getCharClass(i, index, character)} key={index}>{character}</span>
                    ))}
                  </span>
                <span> </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
    )}
      
      {status === 'finished' && (
        <div className="section">
          <div className="columns">
            <div className="column has-text-centered">
              <p className="is-size-5">Words per minute</p>
              <p className="has-text-primary is-size-1">
                {correct}
              </p>
            </div>
          <div className="column has-text-centered">
            <div className="is-size-5">Accuracy :</div>
            <p className="has-text-info is-size-1">
              {Math.round((correct / (correct + incorrect)) * 100)} %
            </p>
          </div>
        </div>
      </div>
      )}
      
    </div>
  );
}

export default App;

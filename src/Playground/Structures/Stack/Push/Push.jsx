import { useState, useEffect } from "react";

function stackSteps(value = 0, existingStack = [], maxSize = 6) {
  const stack = [...existingStack];
  const steps = [];

  function save(codeLine, description, phase, active = -1) {
    steps.push({
      stack: [...stack],
      value,
      top: stack.length - 1,
      size: stack.length,
      maxSize,
      phase,
      codeLine,
      description,
      active,
    });
  }

  save(1, "Current Stack", "idle");

  if (stack.length >= maxSize) {
    save(2, "Check if stack is full", "checking");
    save(3, "Stack Overflow", "overflow");
    save(4, "Return from function", "done");
    return steps;
  }

  save(2, "Check if stack is full", "checking");

  save(5, "Increment top", "updating");

  stack.push(value);

  save(6, `Insert ${value} into stack`, "pushing", stack.length - 1);

  save(7, "Return from function", "done");

  return steps;
}

const CodeLines = [
  <>
    <span className="dfp-type">void</span> push
    <span className="dfp-symbol">(</span>
    <span className="dfp-type">int</span> value
    <span className="dfp-symbol">)</span>{" "}
    <span className="dfp-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfp-keyword">if</span>{" "}
    <span className="dfp-symbol">(</span>
    top <span className="dfp-symbol">==</span> MAX - 1
    <span className="dfp-symbol">)</span>{" "}
    <span className="dfp-symbol">{"{"}</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="dfp-function">cout</span>
    <span className="dfp-symbol"> &lt;&lt; </span>
    <span className="dfp-string">"Stack Overflow"</span>
    <span className="dfp-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <span className="dfp-keyword">return</span>
    <span className="dfp-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    top<span className="dfp-symbol">++;</span>
  </>,

  <>
    &nbsp;&nbsp;
    stack<span className="dfp-symbol">[</span>top
    <span className="dfp-symbol">]</span>{" "}
    <span className="dfp-symbol">=</span> value
    <span className="dfp-symbol">;</span>
  </>,

  <>
    &nbsp;&nbsp;
    <span className="dfp-keyword">return</span>
    <span className="dfp-symbol">;</span>
  </>,

  <>
    <span className="dfp-symbol">{"}"}</span>
  </>,
];

const SpeedDelay = {
  1: 1400,
  2: 1100,
  3: 850,
  4: 650,
  5: 500,
  6: 380,
  7: 280,
  8: 200,
  9: 140,
  10: 90,
};

const Push = () => {
  const [inputValue, setInputValue] = useState("");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5);

  const [newElement, setNewElement] = useState(null);
  const [elements, setElements] = useState([
    {
      id: 1,
      value: 10,
    },
    {
      id: 2,
      value: 20,
    },
    {
      id: 3,
      value: 30,
    },
    {
      id: 4,
      value: 40,
    },
    {
      id: 5,
      value: 50,
    },
  ]);

  const steps = stackSteps(newElement ? newElement.value : "", elements.map(element => element.value));

  const current = steps[index];

  const reset = () => {
    setPlaying(false);
    setIndex(0);
    setNewElement(null);
    setInputValue("");
    setElements([
      {
        id: 1,
        value: 10,
      },
      {
        id: 2,
        value: 20,
      },
      {
        id: 3,
        value: 30,
      },
      {
        id: 4,
        value: 40,
      },
      {
        id: 5,
        value: 50,
      },
    ])
  };

  const stepForward = () => {
    setPlaying(false);
    if (index < steps.length - 1) {
      if (!newElement) {
        setNewElement({
          id: Date.now(),
          value: inputValue === "" || isNAN(Number(inputValue)) ? Math.floor(Math.random() * 99) : Number(inputValue),
        });
      }
      setIndex(index + 1);
    }
  };

  const stepBack = () => {
    setPlaying(false);
    if (index > 0) setIndex(index - 1);
  };

  const togglePlay = () => {
    if (index === steps.length - 1) setIndex(0);

    if (!newElement) {
      setNewElement({
        id: Date.now(),
        value: inputValue === "" || isNAN(Number(inputValue)) ? Math.floor(Math.random() * 99) : Number(inputValue),
      });
    }
    setPlaying(!playing);
  };

  useEffect(() => {
    if (current.phase === "done" && newNode) {
      setElements(prev => [
        { id: newNode.id, value: newNode.value },
        ...prev,
      ]);

      setNewElement(null);
      setIndex(0);
      setPlaying(false);
    }
  }, [current.phase]);

  useEffect(() => {
    if (!playing) return;

    const timer = setTimeOut(() => {
      if (index < steps.length - 1) {
        setIndex(prev => prev + 1);
      }
      else {
        setPlaying(false);
      }
    }, SpeedDelay[speed]);

    return () => clearTimeout(timer);
  }, [playing, index, speed, steps.length]);

  return (
    <div className="push-wrapper">
      <div className="push">
        <p className="p-eyebrow">stack</p>
        <h1 className="p-title">Push</h1>

        <div className="p-header">
          <p className="i-blurb">
            New Elements comes in top of the previous element.
          </p>

          <div className="p-complexity">
            <div>
              <div className="p-complexity-label">time</div>
              <div className="p-time-value">O(1)</div>
            </div>
            <div>
              <div className="p-complexity-label"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Push

import React, { useState } from 'react';
import './App.css';

function uuidv4() {
  //@ts-ignore
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

interface Task {
  id: string;
  text: string;
}

function createTask(text: string) {
  return {
    id: uuidv4(),
    text: text
  }
}

function NewTask(props: any) {
  let [val, setVal] = useState('');
  return <>
  <input value={val} onChange={(ev:any)=>setVal(ev.target.value)}/>
  <div onClick={()=>{props.onAdd(val); setVal('');}}>+</div></>;
}

function Task(props: any) {
  return <div>{props.task.text}</div>
}

const App: React.FC = () => {
  let [tasks, setTasks] = useState([{}] as Task[]);
  return (
    <div className="App">
      tTask<>
      {tasks.map((t) => <Task key={t.id} task={t} />)}</>
      <NewTask onAdd={(v:any) => { setTasks(tasks.concat([createTask(v)]));}}/>
    </div>
  );
}


export default App;

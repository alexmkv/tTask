import React, { useState } from 'react';
import './App.css';
import { get, set } from 'idb-keyval';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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
  const onAdd = ()=>{props.onAdd(val); setVal('');}
  return <>
  <input value={val} onChange={(ev:any)=>setVal(ev.target.value)} onKeyDown={(e:any)=>{
    (e.key === "Enter") && onAdd();}} />
  <div onClick={onAdd}>+</div></>;
}

function Task(props: any) {
  return <div>{props.task.text}</div>
}

async function getTasks():Promise<Task[]> 
{
  return get('tasks') as any;
}

const gtasks = getTasks();

const App: React.FC = () => {
  let [tasks, setTasks] = useState(undefined as (Task[]|undefined));
  if (tasks == undefined) {
    gtasks.then((v:any)=>{
      if (!Array.isArray(v)) v = [];
      setTasks(v);
    })
  }
  const ts = (tasks || []) as Task[];
  
  return (
    <div className="App">
      tTask<>
      {ts.map((t) => <Task key={t.id} task={t} />)}</>
      <NewTask onAdd={(v:any) => { let na = ts.concat([createTask(v)]); set('tasks', na); setTasks(na);}} />
    </div>
  );
}


export default App;

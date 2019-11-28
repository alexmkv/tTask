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
  return <div className="row"><div>{props.task.text}</div><div onClick={props.onDelete}>x</div></div>
}

async function getTasks():Promise<Task[]> 
{
  return get('tasks') as any;
}

function Actions(props:any) {
  return <div className="row"><div onClick={props.onUpload}>Upload</div><div onClick={props.onDownload}>Download</div></div>
}

const gtasks = getTasks();

function download(filename:string, text:string) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);

  if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
  }
  else {
      pom.click();
  }
}

const App: React.FC = () => {
  let [tasks, setTasks] = useState(undefined as (Task[]|undefined));
  if (tasks == undefined) {
    gtasks.then((v:any)=>{
      if (!Array.isArray(v)) v = [];
      setTasks(v);
    })
  }
  const ts = (tasks || []) as Task[];
  const update = (t: any) => {
    set('tasks', t);
    setTasks(t);
  }
  const onDownload=()=>{
    download('content.json', JSON.stringify(tasks));
  }
  const onUpload=()=>{
    var input = document.createElement('input');
    input.type = 'file';
    
    input.onchange = (e:any) => { 
       var file = e.target.files[0]; 
       var reader = new FileReader();
       reader.readAsText(file); // this is reading as data url
       reader.onload = (readerEvent:any) => {
         update(JSON.parse(readerEvent.target.result));
       }
    
    }
    
    input.click();    

  }
  
  return (
    <div className="App">
      tTask<>
      {ts.map((t) => <Task key={t.id} task={t} onDelete={()=>{update(ts.filter(tf => tf.id != t.id)) }} />)}</>
      <NewTask onAdd={(v:any) => { update(ts.concat([createTask(v)]))}} />
      <Actions onDownload={onDownload} onUpload={onUpload}/>
    </div>
  );
}


export default App;

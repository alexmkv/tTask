// implement: https://github.com/dropbox/dropbox-sdk-js/blob/master/examples/javascript/auth/index.html
// split on several files
import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { get, set } from "idb-keyval";
import { Dropbox } from "dropbox";
import {
  getAuthenticationUrl,
  isAuthenticated,
  getAccessTokenFromUrl
} from "./dropbox";

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let gTasks: any;

interface Task {
  id: string;
  text: string;
  done?: boolean;
}

function createTask(text: string) {
  return {
    id: uuidv4(),
    text: text
  };
}

interface EditTaskProps {
  task: Task;
  onChange: (t: Task) => void;
  onNext: () => void;
  onNextOrCreate: () => void;
  onPrev: () => void;
  onDone: () => void;
}

function EditTask(props: EditTaskProps) {
  const inpRef: any = useRef(null);
  useEffect(() => {
    inpRef.current.focus();
  });
  return (
    <div className="row">
      <input
        className={props.task.done ? "done" : ""}
        ref={inpRef}
        value={props.task.text}
        onChange={(ev: any) => {
          props.task.text = ev.target.value;
          props.onChange(props.task);
        }}
        onKeyDown={(e: any) => {
          if (e.key === "Enter" && e.ctrlKey) props.onDone();
          else if (e.key === "Enter") {
            props.onNextOrCreate();
          } else if (e.key === "ArrowUp") {
            props.onPrev();
          } else if (e.key === "ArrowDown") {
            props.onNext();
          }

          //e.key === "Enter" && onAdd();
        }}
      />
    </div>
  );
}

function Task(props: any) {
  return (
    <div className={"row " + (props.task.done ? "done" : "")}>
      <div onClick={props.onActivate} className={props.task.done ? "done" : ""}>
        {props.task.text}
      </div>
      <div onClick={props.onDelete}>x</div>
    </div>
  );
}

async function getTasks(): Promise<Task[]> {
  return get("tasks") as any;
}

function Actions(props: any) {
  return (
    <div className="row">
      <div onClick={props.onUpload}>Upload</div>
      <div onClick={props.onDownload}>Download</div>
    </div>
  );
}

function DropboxCmp(props: any) {
  let [status, setStatus] = useState("-");
  const onPut = () => {
    setStatus("-");
    //@ts-ignore
    let dbx: any = new Dropbox({
      accessToken:
        "_gazk0s4vNsAAAAAAAAHhyoNC4CMtgX-dfDZfRlWT1jnCDEeuUTA2bUTlBGZc-bd"
    });
    dbx
      .filesUpload({
        contents: JSON.stringify(gTasks),
        path: "/tTask.json",
        mode: { ".tag": "overwrite" }
      })
      .then((response: any) => {
        setStatus("put ok");
      });
  };
  const onGet = () => {
    //@ts-ignore
    setStatus("-");
    let dbx: any = new Dropbox({
      accessToken: getAccessTokenFromUrl()
    });
    dbx
      .filesDownload({
        path: "/tTask.json"
      })
      .then((response: any) => {
        response.fileBlob.text().then((txt: string) => {
          props.onGet(JSON.parse(txt));
          setStatus("get ok");
        });
      });
  };
  return (
    <div className="row">
      <div>Dropbox:</div>
      <div>Status: {status}</div>
      <div>isauth:{isAuthenticated() ? "yes" : "no"}</div>
      <div>
        <a href={getAuthenticationUrl()}>Dropbox auth</a>
      </div>
      <div onClick={onPut}>Put</div>
      <div onClick={onGet}>Get</div>
    </div>
  );
}

const gtasks = getTasks();

function download(filename: string, text: string) {
  var pom = document.createElement("a");
  pom.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  pom.setAttribute("download", filename);

  if (document.createEvent) {
    var event = document.createEvent("MouseEvents");
    event.initEvent("click", true, true);
    pom.dispatchEvent(event);
  } else {
    pom.click();
  }
}

const App: React.FC = () => {
  let [tasks, setTasks] = useState(undefined as Task[] | undefined);
  const ts = (tasks || []) as Task[];
  let [activeTaskId, setActiveTaskId] = useState(
    undefined as undefined | string
  );

  if (tasks === undefined) {
    gtasks.then((v: any) => {
      if (!Array.isArray(v)) v = [createTask("")];
      setTasks(v);
    });
  }
  gTasks = tasks;

  const update = (t: any) => {
    set("tasks", t);
    setTasks(t);
  };
  const onDownload = () => {
    download("content.json", JSON.stringify(tasks));
  };
  const onUpload = () => {
    var input = document.createElement("input");
    input.type = "file";

    input.onchange = (e: any) => {
      var file = e.target.files[0];
      var reader = new FileReader();
      reader.readAsText(file); // this is reading as data url
      reader.onload = (readerEvent: any) => {
        update(JSON.parse(readerEvent.target.result));
      };
    };

    input.click();
  };

  const move = (up: boolean, create: boolean) => {
    let idx = 0;
    for (; idx < ts.length; ++idx) {
      if (ts[idx].id === activeTaskId) break;
    }
    if (up) {
      if (idx > 0) setActiveTaskId(ts[idx - 1].id);
    }
    if (!up) {
      if (idx < ts.length - 1) setActiveTaskId(ts[idx + 1].id);
      else if (create) {
        const nt = createTask("");
        update(ts.concat([nt]));
        setActiveTaskId(nt.id);
      }
    }
  };

  return (
    <div className="App">
      tTask
      <>
        {ts.map(t =>
          t.id === activeTaskId ? (
            <EditTask
              key={t.id}
              task={t}
              onChange={(t: Task) => {
                update([...ts]);
              }}
              onNext={() => move(false, false)}
              onPrev={() => move(true, false)}
              onNextOrCreate={() => move(false, true)}
              onDone={() => {
                t.done = !t.done;
                update([...ts]);
              }}
            />
          ) : (
            <Task
              key={t.id}
              task={t}
              onActivate={() => setActiveTaskId(t.id)}
              onDelete={() => {
                update(ts.filter(tf => tf.id !== t.id));
              }}
            />
          )
        )}
      </>
      <Actions onDownload={onDownload} onUpload={onUpload} />
      <DropboxCmp
        onGet={(t: Task[]) => {
          update(t);
        }}
      />
    </div>
  );
};

export default App;

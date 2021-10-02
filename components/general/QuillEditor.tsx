import { useState, useRef, forwardRef } from "react";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import katex from "katex";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading....</p>,
});

// const QuillEditorWithRef = forwardRef((props, ref) => (
//   <ReactQuill {...props} ref={ref} />
// ));
const Quill = dynamic(() => import("react-quill").then((m) => m.Quill as any), {
  ssr: false,
});
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";

const modulesSnow = {
  //table:true,
  toolbar: [
    [{ header: [2, 3, 4, false] }],
    //[{ size: ["small", false, "large"] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ color: [] }, { background: [] }],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["formula"],
    ["clean"],
  ],
};
const modulesBubble = {
  toolbar: [["formula", "bold", "italic", "underline", "blockquote", "clean"]],
};

export interface QuillEditorProps {
  defaultValue?: string;
  value: string;
  placeholder?: string;
  theme?: "bubble" | "snow";
  className?: string;
  onChange: (text: string, delta: any, source: string, editor: any) => void;
}

const QuillEditor = (props: QuillEditorProps) => {
  const [canPaste, setCanPaste] = useState<boolean>(false);
  const [rEditor, setREditor] = useState(null);
  const [editor, setEditor] = useState(null);
  useEffect(() => {
    if (katex) window.katex = katex;
    //onsole.log(Quill);
    if (ReactQuill) {
      //console.log(ReactQuill)
      //console.log(ReactQuill.editor);
      setCanPaste(true);
    }
  }, []);

  useEffect(() => {
    if (rEditor) setEditor(rEditor.getEditor());
  }, [rEditor]);

  const handlePasteHTML = (e) => {
    const p = prompt("Enter the HTML");
    if (p !== null) {
      console.log(p);
    }
  };
  return (
    <>
      {canPaste && props.theme !== "bubble" && (
        <p
          onClick={(e) => handlePasteHTML(e)}
          className="pointer-cursor px-3 max-w-max py-1 text-gray-50 bg-primary my-2 text-xs"
        >
          Paste HTML
        </p>
      )}
      <ReactQuill
        //ref={(el)=>setREditor(prev=>el)}
        value={props.value}
        onChange={(text: string, delta: any, source: string, editor: any) => {
          return props.onChange(text, delta, source, editor);
        }}
        placeholder={props.placeholder}
        modules={
          props.theme && props.theme === "bubble" ? modulesBubble : modulesSnow
        }
        //theme={props.theme ? props.theme : "snow"}
        className={props.className ? props.className : ""}
      />
    </>
  );
};

export default QuillEditor;

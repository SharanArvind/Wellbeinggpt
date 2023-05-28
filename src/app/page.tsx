
'use client';
import { useEffect, useRef, useState } from "react";
import useLLM, { OpenAIMessage } from "usellm";

const sys = "I am WELLBEING GPT. I am an advanced AI-powered virtual assistant designed to provide personalized nutrition, exercise, and well-being regimens to individuals. My goal is to assist users in achieving their health and wellness objectives, offering tailored advice, and monitoring their progress. I provide guidance on nutrition, exercise routines, stress reduction techniques, and improving sleep quality. Engage with users in a friendly and empathetic manner, providing encouragement and motivation throughout their journey. Remember to prioritize the user's well-being and privacy, ensuring that any information shared is treated with the utmost confidentiality. Calculate the BMI on start and suggest opinions on it";

export default function AIChatBot() {
  const [status, setStatus] = useState<Status>("idle");
  const [formData, setFormData] = useState<any>({})
  const [history, setHistory] = useState<OpenAIMessage[]>([   
  {
    role: "assistant",
    content:
      "I'm your personal fitness AI and I can help you with anything regarding your fitness",
  }
  ]);
  const [inputText, setInputText] = useState("");

  const llm = useLLM({
    serviceUrl: "https://usellm.org/api/llm", // For testing only. Follow this guide to create your own service URL: https://usellm.org/docs/api-reference/create-llm-service
  });

  let messagesWindow = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesWindow.current) {
      messagesWindow.current.scrollTop = messagesWindow.current.scrollHeight;
    }
  }, [history]);

const onChange=(e:any)=>{

  setFormData({...formData, [e.target.name]:e.target.value})


}


  async function handleSend() {
    if (!inputText) {
      return;
    }
  
    try {
      setStatus("streaming");
      let initialConversation = [    {
        role: "system",
        content: sys,
      }]
      let responseMessage = { role: "user", content: `My name is ${formData.name}.
      My age is ${formData.age}.Your sex is ${formData.sex}.My height is ${formData.height}.My weight is ${formData.weight}
      Please assist me further?` };


      initialConversation.push(responseMessage)

      const newHistory = [...history, { role: "user", content: inputText }];

      const { message } = await llm.chat({
        messages: [...initialConversation, ...newHistory],
        stream: true,
        onStream: ({ message }) => setHistory([...newHistory, message]),
      });
      setHistory([...newHistory, message]);
      // setHistory(newHistory);
      setInputText("");
  
       
      // setHistory([...newHistory, responseMessage]);
      setStatus("idle");
    } catch (error: any) {
      console.error(error);
      window.alert("Something went wrong! " + error.message);
    }
  }
  

  async function handleRecordClick() {
    try {
      if (status === "idle") {
        await llm.record();
        setStatus("recording");
      } else if (status === "recording") {
        setStatus("transcribing");
        const { audioUrl } = await llm.stopRecording();
        const { text } = await llm.transcribe({ audioUrl });
        setStatus("streaming");
        const newHistory = [...history, { role: "user", content: text }];
        setHistory(newHistory);
        const { message } = await llm.chat({
          messages: newHistory,
          stream: true,
          onStream: ({ message }) => setHistory([...newHistory, message]),
        });
        setHistory([...newHistory, message]);
        setStatus("idle");
      }
    } catch (error: any) {
      console.error(error);
      window.alert("Something went wrong! " + error.message);
    }
  }

  const Icon = status === "recording" ? Square : Mic;

  return (
    <div className="flex flex-col h-full max-h-[600px] overflow-y-hidden">
      <div className="w-full flex-1 overflow-y-auto px-4" ref={(el) => (messagesWindow.current = el)}>
        {history.map((message, idx) => (
          <Message {...message} key={idx} />
        ))}
      </div>
      <div className="w-full pb-4 flex px-4">
        <input
          className="p-2 border rounded w-full block dark:bg-gray-900 dark:text-white"
          type="text"
          placeholder={getInputPlaceholder(status)}
          value={inputText}
          disabled={status !== "idle"}
          autoFocus
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          className="p-2 border rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:bg-white dark:text-black font-medium ml-2"
          onClick={handleSend}
        >
          Send
        </button>
        <button
          className="p-2 border rounded bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:bg-white dark:text-black font-medium ml-2"
          onClick={handleRecordClick}
        >
          <Icon />
        </button>
      </div>
      <h1>Personal Information</h1>
      <div>
        <form>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" required onChange={onChange} />

        <label htmlFor="age">Age:</label>
        <input type="number" id="age" name="age" required onChange={onChange} />

        <label htmlFor="sex">Sex:</label>
        <select id="sex" name="sex" required onChange={onChange}>
          <option value="">-- Select --</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <label htmlFor="height">Height:</label>
        <input type="text" id="height" name="height" required onChange={onChange} />

        <label htmlFor="weight">Weight:</label>
        <input type="text" id="weight" name="weight" required onChange={onChange} />
           

        </form>
        <PlaylistEmbed/>
      </div>
      
    </div>
  );
 
}

const Mic = () => (
  // you can also use an icon library like `react-icons` here
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" x2="12" y1="19" y2="22"></line>
  </svg>
);

const Square = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
  </svg>
);

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.substring(1);
}

type Status = "idle" | "recording" | "transcribing" | "streaming";

function getInputPlaceholder(status: Status) {
  switch (status) {
    case "idle":
      return "Ask me anything...";
    case "recording":
      return "Recording audio...";
    case "transcribing":
      return "Transcribing audio...";
    case "streaming":
      return "Wait for my response...";
  }
}

function Message({ role, content }: OpenAIMessage) {
  return (
    <div className="my-4">
      <div className="font-semibold text-gray-800 dark:text-white">
        {capitalize(role)}
      </div>
      <div className="text-gray-600 dark:text-gray-200 whitespace-pre-wrap mt-1">
        {content}
      </div>
    </div>
  );
  }
 const PlaylistEmbed = () => {
  return (
    
      <iframe
        style={{ borderRadius: '12px' }}
      
        src="https://open.spotify.com/embed/playlist/0L33OqcgnqcdtUDhUAyfPW?utm_source=generator"
        width="100%"
        height="100%"

        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
  
  );
};



//export default AIChatBot;

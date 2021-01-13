import "./App.css";
import React, { useEffect, useState, useRef, useReducer } from "react";
import { MessageBox } from "react-chat-elements";
import { Input } from "react-chat-elements";
import socketIOClient from "socket.io-client";

const initialState = { messages: [] };

const reducer = (state, action) => {
    switch (action.type) {
        case "RECEIVE_MESSAGE":
            return { messages: [...state.messages, action.message] };
        default:
            throw new Error();
    }
};

const App = () => {
    const ENDPOINT = "http://127.0.0.1:5000/";
    const [socket, setSocket] = useState(null);
    const textRef = useRef();
    const chatContainerBottomRef = useRef();
    const [state, dispatch] = useReducer(reducer, initialState);
    const [userData, setUserData] = useState(null);

    const handleSendMessage = (socket, message, from) => {
        socket.emit("SEND_MESSAGE", { from, message });
        textRef.current.value = "";
    };

    useEffect(() => {
        const socket = socketIOClient(ENDPOINT);
        setSocket(socket);
        const username = prompt("username");
        const room = prompt("room");
        setUserData({ username, room });

        socket.emit("JOIN", { username, room });
        socket.on("RELAY_MESSAGE", (message) => {
            
            chatContainerBottomRef.current.scrollIntoView({ behavior: 'smooth' });
            dispatch({ type: "RECEIVE_MESSAGE", message });
        });
        const listener = (e) => {
            if (e.key === "Enter") {
                handleSendMessage(socket, textRef.current.value, username);
            }
        };
        document.addEventListener("keyup", listener);

        return () => {
            document.removeEventListener("keyup", listener);
        };
    }, []);
    const messageBoxList = state.messages.map((d) => {
        return (
            
            <MessageBox
                position={d.from === userData.username ? "right" : "left"}
                title={d.from === userData.username ? "" : d.from}
                type={"text"}
                text={d.message}
            />
        );
    });
    return (
        <div className="app">
            {socket && (
                <div className="chat">
                    <div className="chat__header">
                        <h2>{userData.username}</h2>
                        <h2>{userData.room}</h2>
                    </div>
                    <div className="chat__messageList">
                        {messageBoxList}
                        <div className="chat__bottom" ref={chatContainerBottomRef}></div>
                    </div>
                    <div className="chat__inputMessage">
                        <textarea type="text" ref={textRef} />
                        <button
                            onClick={() =>
                                handleSendMessage(
                                    socket,
                                    textRef.current.value,
                                    userData.username
                                )
                            }
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;

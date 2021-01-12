import "./App.css";
import React, { useEffect, useState } from "react";
import { MessageBox } from "react-chat-elements";
import { Input } from "react-chat-elements";
import socketIOClient from "socket.io-client";

const App = () => {
    const ENDPOINT = "http://127.0.0.1:5000/";
    const [userData, setUserData] = useState({
        username: "",
        room: "",
    });
    const [message, setMessage] = useState("");
    const [socket, setSocket] = useState(null);
    const [messageList, setMessageList] = useState([]);
    const handleSendMessage = (socket, message) => {
        socket.emit("SEND_MESSAGE", {
            message,
            from: userData.username,
        });
    };
    useEffect(() => {
        const listener = (e) => {
            if (e.key === "Enter") {
                handleSendMessage(socket,message);
            }
        }
        document.addEventListener("keyup", listener);
        return () => {
            document.removeEventListener("keyup",listener);
        };
    }, [socket, message]);
    useEffect(() => {
        if (userData.username && userData.room) {
            const socket = socketIOClient(ENDPOINT);
            setSocket(socket);
        } else {
            const username = prompt("enter username");
            const room = prompt("enter room");

            setUserData({ username, room });
        }
    }, [userData]);
    useEffect(() => {
        if (socket) {
            socket.emit("JOIN", userData);
            socket.on("USER_JOINED", (message) => {
                alert(message);
            });
        }
    }, [socket]);
    useEffect(() => {
        if (socket) {
            socket.on("RELAY_MESSAGE", (message) => {
                console.log(messageList);
                setMessageList([...messageList, message]);
                setMessage("");
            });
        }
    }, [socket, messageList]);
    const messageBoxList = messageList.map((d) => {
        return (
            <MessageBox
                position={d.from === userData.username ? "right" : "left"}
                type={"text"}
                text={d.message}
                title={d.from === userData.username ? "" : d.from}
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
                    <div className="chat__messageList">{messageBoxList}</div>
                    <div className="chat__inputMessage">
                        <textarea
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button
                            onClick={() => {
                                handleSendMessage(socket, message);
                            }}
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

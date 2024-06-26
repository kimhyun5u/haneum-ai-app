"use client";

import { useEffect, useRef, useState } from "react";
import Container from "../../components/Container";
import ScoreCardSlider from "../../components/score/ScoreCardSlider";
import ScoreHeader from "../../components/score/ScoreHeader";
import { socket } from "../socket";

import { AddCircleOutlineOutlined } from "@mui/icons-material";


export default function Score() {
  const epsonAuthRef = useRef();

  const [scoreFiles, setScoreFiles] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const handleFileInputChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const scoreFile = {
      type: file.type,
      url: URL.createObjectURL(file),
    };

    setScoreFiles([...scoreFiles, scoreFile]);
  };

  const handleOpenModal = () => {
    epsonAuthRef.current.showModal();
  };

  const handleCloseModal = () => {
    epsonAuthRef.current.close();
  };

  const handleEpsonConnectAuth = async (event) => {
    event.preventDefault();
    
    const { email } = event.target;

    const response = await fetch("/api/epson/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.value, password: "" }),
    });
      
    const data = await response.json();

    if (response.ok) {
      console.log("Authenticated successfully", data);
      handleCloseModal();
    } else {
      console.error("Authentication failed", data);
    }
  }

  return (
    <div className="h-full ">
      <ScoreHeader className="absolute w-full z-30" />
      <div className="h-full flex flex-col pt-20">
        <Container>
          <h3 className="font-extrabold text-3xl">정간보 변환</h3>
          <label className="text-gray-500">
            * 현재 단소 악보 및 오선보 변환 지원
          </label>
        </Container>
        <div className="h-full flex flex-col items-center justify-center">
          {scoreFiles.length === 0 ? (
            <Container className="flex flex-col text-center justify-center items-center gap-3 mb-56">
              <div className="mb-10">
                <AddCircleOutlineOutlined sx={{ fontSize: "120px" }} className="text-gray-400" />
                <p>
                  Epson Scanner에 연결하여,
                  <br /> 자동으로 추가해보세요
                </p>
              </div>
              <button
                className="w-64 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg transition-colors duration-300"
                onClick={handleOpenModal}
              >
                Epson Connect 연결
              </button>
              <label htmlFor="file-input" className="w-64">
                <button
                  id="file-select-btn"
                  className="w-full bg-gray-300 hover:bg-gray-500 text-black font-bold py-3 px-5 rounded-lg transition-colors duration-300"
                  onClick={() => document.getElementById("file-input").click()}
                >
                  파일 가져오기
                </button>
              </label>
              <input
                id="file-input"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInputChange}
              />
            </Container>
          ) : (
            <>
              <div className="w-full h-full">
                <ScoreCardSlider scores={scoreFiles} />
              </div>
              <Container className="flex flex-row w-full text-center justify-center items-center gap-3 mt-5 mb-10">
                <label htmlFor="file-input">
                  <button
                    id="file-select-btn"
                    className="bg-gray-300 hover:bg-gray-500 text-black font-bold py-3 px-5 rounded-lg transition-colors duration-300"
                    onClick={() =>
                      document.getElementById("file-input").click()
                    }
                  >
                    파일 가져오기
                  </button>
                </label>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <button className="grow bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg transition-colors duration-300">
                  변환하기
                </button>
              </Container>
            </>
          )}
        </div>
      </div>

      <dialog
        ref={epsonAuthRef}
        className="relative bg-white backdrop:bg-black/20 backdrop:backdrop-blur-sm rounded-lg shadow dark:bg-gray-700"
        onClick={(event) => {
          if (event.target === epsonAuthRef.current) {
            handleCloseModal();
          }
        }}
      >
        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
          <h3 className="text-xl font-semibold text-blue-800 dark:text-white">
            EPSON CONNECT
          </h3>
          <button
            type="button"
            className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            onClick={handleCloseModal}
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        <div className="py-5 px-8 flex flex-wrap">
          <form className="w-80" onSubmit={handleEpsonConnectAuth}>
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Epson 제품에 연결된 이메일 ID
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                placeholder="name@print.epsonconnect.com"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-7 mb-12 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              인증
            </button>
            <div className="text-sm font-medium text-center text-gray-500 dark:text-gray-300">
              미등록 제품인가요?{" "}
              <a
                href="https://www.epsonconnect.com/guide/ko/html/p01.htm"
                target="_blank"
                className="text-blue-500 hover:underline dark:text-blue-500"
              >
                Epson Connect 계정 연동
              </a>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}

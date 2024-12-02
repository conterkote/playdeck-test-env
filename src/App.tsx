import './App.css'
import {useEffect, useRef, useState} from "react";

type Profile = {
  avatar: string,
  username: string,
  firstName: string,
  lastName: string,
  telegramId: number,
  locale: 'en' | 'ru',
  token: string, // You can read more about our jwt token https://github.com/ton-play/playdeck-integration-guide/wiki/4.--User-JWT
  params: { [key: string]: string }, // You can create a link with a query string to the game using the method customShare or getShareLink
  sessionId: string,
  currentGameStarted: number
};

const fakeProfile: Profile = {
  avatar: "https://kartinki.pics/pics/uploads/posts/2022-08/thumbs/1660617523_1-kartinkin-net-p-raian-gosling-oboi-krasivo-1.jpg",
  currentGameStarted: 1,
  firstName: "Тайлер",
  lastName: "Гослинг",
  locale: "ru",
  telegramId: 432523432,
  token: "123456askdjasl",
  sessionId: "1ofjasudpU0-34",
  params: {},
  username: "real.gosling"
}

const YOUR_APP_URL = import.meta.env.VITE_YOUR_APP_URL; // Пример: "http://localhost:5173"

const methods = {
  "getUserProfile": (target: Window) => {
    target.postMessage({playdeck: {method: 'getUserProfile', value: fakeProfile}}, '*');
  },
  "getToken": (target: Window) => {
    target.postMessage({playdeck: {method: 'getUserProfile', value: fakeProfile.token}}, '*');
  },
  "loading": () => {
    // Метод без ответа, всё происходит только на стороне Playdeck
  },
  "showAd": (target: Window) => {
      target.postMessage({playdeck: {method: 'rewardedAd'}}, '*');
      // 'rewardedAd' - пользователь досмотрел рекламу и его можно наградить
      // 'errAd' - что-то пошло не так на стороне плейдек при показе рекламы
      // 'skipAd' - пользователь пропустил рекламу (не досмотрел)
      // 'notFoundAd' - плейдек не смог найти рекламу для пользователя
      // 'startAd' - пользователь начал смотреть рекламу
  }
}

function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const iFrameRef = useRef<HTMLIFrameElement>(null)
  const onLoad = () => {
    setIsLoaded(true)
  }

  useEffect(() => {
    const receiveMessageFromChildren = (message: MessageEvent) => {
      if (!message || !message.data || !message.data.playdeck) return;
      if (message.origin !== YOUR_APP_URL) return;

      const {method} = message.data.playdeck;

      const typedMethod = method as keyof typeof methods;
      if (!iFrameRef.current || !iFrameRef.current.contentWindow) return;

      methods[typedMethod](iFrameRef.current.contentWindow)
    }

    if (!iFrameRef.current) return;
    if (!iFrameRef.current.contentWindow) return;

    window.addEventListener("message", receiveMessageFromChildren)

    return () => {
      window.removeEventListener("message", receiveMessageFromChildren)
    }
  }, [isLoaded])

  return (
    <iframe src={YOUR_APP_URL}
            ref={iFrameRef}
            onLoad={onLoad}
            style={{border: "none", width : "100vw", height : "100vh"}}
    />
  )
}

export default App

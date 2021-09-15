import NProgress from "nprogress";
import { useRouter } from "next/router";
import { DefaultSeo } from "next-seo";
import { useEffect } from "react";
import { Provider } from "react-redux";
import store, { useAppSelector, useAppDispatch } from "../redux/store";
import "katex/dist/katex.css";
import { APP_NAME, DESCRIPTIONS } from "../utils/constants";
import "nprogress/nprogress.css";
import "../styles.css";
import { setLoading, setLogin, setToken, setUser } from "../redux/authSlice";
import Cookies from "js-cookie";
import api from "../utils/fetcher";
import { SWRConfig } from "swr";
NProgress.configure({ showSpinner: false });

const swrFetcher = async (url, init) => {
  //console.log(url)
  //console.log(init);
  const res = await api.get(url);
  return res.data;
};

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const { user, isLoading, loggedIn } = store.getState().auth;

  useEffect(() => {
    const startProgress = () => NProgress.start();
    const stopProgress = () => NProgress.done();

    router.events.on("routeChangeStart", startProgress);
    router.events.on("routeChangeComplete", stopProgress);
    router.events.on("routeChangeError", stopProgress);

    return () => {
      router.events.off("routeChangeStart", startProgress);
      router.events.off("routeChangeComplete", stopProgress);
      router.events.off("routeChangeError", stopProgress);
    };
  }, [router]);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      localStorage.removeItem("user");
      Cookies.remove("token");
    }
    const userData = localStorage.getItem("user");
    if (token && !loggedIn && !user && userData) {
      store.dispatch(setUser(JSON.parse(userData)));
      store.dispatch(setLogin(true));
      store.dispatch(setLoading(false));
      store.dispatch(setToken(token));
    } else if (!user) {
      Cookies.remove("token");
      store.dispatch(setLoading(false));
    }
    return () => store.dispatch(setLoading(true));
  }, [user, isLoading, loggedIn]);

  return (
    <Provider store={store}>
      <DefaultSeo
        titleTemplate={`%s | ${APP_NAME}`}
        defaultTitle={APP_NAME}
        description={DESCRIPTIONS}
      />
      <SWRConfig
        value={{
          fetcher: async (resource, init) => await swrFetcher(resource, init),
        }}
      >
        <Component {...pageProps} />
      </SWRConfig>
    </Provider>
  );
}

export default MyApp;

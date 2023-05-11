import { Api } from "sst/node/api";
import useRouter from "next/router";
import { useEffect, useState } from "react";
import { Session } from "sst/node/auth";

type Props = {
  api : string
}

export default function Home(props: Props) {
  const api_origin = props.api


  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getSession = async () => {
    const token:any = localStorage.getItem("session");
    if (token) {
      const user = await getUserInfo(token);
      if (user) setSession(user);
    }
    setLoading(false);
  };

  useEffect(() => {
    getSession();
  }, []);

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("session", token);
      window.location.replace(window.location.origin);
    }
  }, []);

  const getUserInfo = async (session : typeof Session) => {
    try {
      const response = await fetch(
        `${api_origin}/session`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session}`,
          },
        }
      );
      return response.json();
    } catch (error) {
      alert(error);
    }
  };

  const signOut = async () => {
    localStorage.removeItem("session");
    setSession(null);
  };


  if (loading) return <div className="container">Loading...</div>;

  return (
    <>

<div className="container">
      <h2>SST Auth Example</h2>
      {session ? (
        <div className="profile">
          <p>Welcome {session.name}!</p>
          <img
            src={session.picture}
            style={{ borderRadius: "50%" }}
            width={100}
            height={100}
            alt=""
          />
          <p>{session.email}</p>
          <button onClick={signOut}>Sign out</button>
        </div>
      ) : (
        
        <div>
    <button onClick={() => useRouter.push(`${api_origin}/auth/google/authorize`)}>
      Login
    </button>
        </div>
      )}
    </div>
    </>
  )

}

export async function getServerSideProps() {
  //@ts-ignore
  const api = Api.api.url;
  return { props: { api : api } };
}
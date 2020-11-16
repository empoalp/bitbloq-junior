import React, { useEffect } from "react";
import Router from "next/router";
import queryString from "query-string";

const LOGIN_MUTATION = `
  mutation Login($googleToken: String!) {
    login(googleToken: $googleToken)
  }
`;

const GoogleRedirectPage = () => {
  useEffect(() => {
    (async () => {
      const { access_token: googleToken } = queryString.parse(location.hash);
      const data = await query(LOGIN_MUTATION, { googleToken });
      localStorage.setItem("token", data.login);
      Router.push("/");
    })();
  }, []);

  return <div></div>;
};

export default GoogleRedirectPage;

import Mustache from "mustache";
import Contact from "../models/Contact";

export const greeting = (): string => {
  const greetings = ["Boa madrugada", "Bom dia", "Boa tarde", "Boa noite"];
  const h = new Date().getHours();
  return greetings[(h / 6) >> 0];
};

export const generateProtocol = (): string => {
  const data = new Date();
  return (
    `0${data.getDate()}`.substr(-2) +
    `0${data.getMonth() + 1}`.substr(-2) +
    data.getFullYear() +
    Math.floor(1000 + Math.random() * 9000)
  );
};

export default (body: string, contact: Contact): string => {
  const view = {
    name: contact ? contact.name : "",
    greeting: greeting(),
    protocol: generateProtocol()
  };
  return Mustache.render(body, view);
};
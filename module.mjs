// @ts-check
import { module } from "@prisma/composer";
import eventerService from "./service.mjs";

export default module("eventor", ({ provision }) => {
  provision(eventerService);
});

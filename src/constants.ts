export interface PluginStorage {
  apiKey: string;
}
export enum ActiveEntity {
  ReplayRequest = 'replayRequest',
  ReplayResponse = 'replayResponse',
  HttpHistoryRequest = 'httpHistoryRequest',
  HttpHistoryResponse = 'httpHistoryResponse',
  HTTPQL = 'httpql',
  MatchAndReplace = 'matchAndReplace'
}
export const PAGE = "/subvert";
export const PROD_API_ENDPOINT = "http://137.184.207.84:8000/api/subvert";
export const DEV_API_ENDPOINT = "https://poc.rhynorater.com/subvertQuery.php?";
export const API_ENDPOINT = window.name === "dev" ? DEV_API_ENDPOINT : PROD_API_ENDPOINT;


export const CONTEXT_ENDPOINT = "/context";
export const QUERY_ENDPOINT = "/query";
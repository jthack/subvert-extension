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
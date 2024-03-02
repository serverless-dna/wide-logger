import { WideLogContainer } from '../logger';

export type LogFormat = WideLogContainer | string;

export abstract class LogFormatter {
  abstract format(logContainer: WideLogContainer): LogFormat;
}
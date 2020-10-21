import type {Feed, Rule} from '../Feed';

export type AddFeedOptions = Omit<Feed, 'type' | '_id' | 'count'>;

export type ModifyFeedOptions = Partial<AddFeedOptions>;

export type AddRuleOptions = Omit<Rule, 'type' | '_id' | 'count'>;

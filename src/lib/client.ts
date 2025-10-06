import {
  type AuthProvider,
  type BlobRef,
  type CountRecordsResponse,
  type GetRecordParams,
  type GetRecordsResponse,
  type IndexedRecordFields,
  type RecordResponse,
  SlicesClient,
  type SortField,
  type WhereCondition,
} from "@slices/client";
import type { OAuthClient } from "@slices/oauth";

export interface ComAtprotoRepoStrongRef {
  uri: string;
  cid: string;
}

export interface FanFicsWorkComment {
  content: string;
  createdAt: string;
  postedTo?: string;
}

export type FanFicsWorkCommentSortFields = "content" | "createdAt" | "postedTo";

export interface FanFicsWorkChapter {
  workAtUri: string;
  title: string;
  /** You can add additional notes to a chapter. Typically, these are displayed before chapter content. Only limited HTML is allowed. */
  authorsNotes?: string;
  content: string;
  /** You can add additional notes to a chapter. Typically, these are displayed after chapter content. Only limited HTML is allowed. */
  endNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type FanFicsWorkChapterSortFields =
  | "workAtUri"
  | "title"
  | "authorsNotes"
  | "content"
  | "endNotes"
  | "createdAt"
  | "updatedAt";

export interface FanFicsWorkChapterChapterRef {
  atUri?: string;
}

export interface FanFicsWork {
  uri?: string;
  author: string;
  title: string;
  /** Tags for content the work may be related to, for example 'fluff' or 'meta' */
  tags: string[];
  /** You can describe your work in a summary. Only limited HTML is allowed. */
  summary: string;
  chapters:
    | FanFicsWorkChapter["Main"]
    | FanFicsWorkChapter["ChapterRef"]
    | ComAtprotoRepoStrongRef
    | { $type: string; [key: string]: unknown }[];
  createdAt: string;
  updatedAt?: string;
}

export type FanFicsWorkSortFields =
  | "uri"
  | "author"
  | "title"
  | "summary"
  | "createdAt"
  | "updatedAt";

export interface FanFicsWorkChapter {
  readonly Main: FanFicsWorkChapter;
  readonly ChapterRef: FanFicsWorkChapterChapterRef;
}

class CommentWorkFicsFanClient {
  private readonly client: SlicesClient;

  constructor(client: SlicesClient) {
    this.client = client;
  }

  async getRecords(
    params?: {
      limit?: number;
      cursor?: string;
      where?: {
        [K in FanFicsWorkCommentSortFields | IndexedRecordFields]?:
          WhereCondition;
      };
      orWhere?: {
        [K in FanFicsWorkCommentSortFields | IndexedRecordFields]?:
          WhereCondition;
      };
      sortBy?: SortField<FanFicsWorkCommentSortFields>[];
    },
  ): Promise<GetRecordsResponse<FanFicsWorkComment>> {
    return await this.client.getRecords("fan.fics.work.comment", params);
  }

  async getRecord(
    params: GetRecordParams,
  ): Promise<RecordResponse<FanFicsWorkComment>> {
    return await this.client.getRecord("fan.fics.work.comment", params);
  }

  async countRecords(
    params?: {
      limit?: number;
      cursor?: string;
      where?: {
        [K in FanFicsWorkCommentSortFields | IndexedRecordFields]?:
          WhereCondition;
      };
      orWhere?: {
        [K in FanFicsWorkCommentSortFields | IndexedRecordFields]?:
          WhereCondition;
      };
      sortBy?: SortField<FanFicsWorkCommentSortFields>[];
    },
  ): Promise<CountRecordsResponse> {
    return await this.client.countRecords("fan.fics.work.comment", params);
  }

  async createRecord(
    record: FanFicsWorkComment,
    useSelfRkey?: boolean,
  ): Promise<{ uri: string; cid: string }> {
    return await this.client.createRecord(
      "fan.fics.work.comment",
      record,
      useSelfRkey,
    );
  }

  async updateRecord(
    rkey: string,
    record: FanFicsWorkComment,
  ): Promise<{ uri: string; cid: string }> {
    return await this.client.updateRecord(
      "fan.fics.work.comment",
      rkey,
      record,
    );
  }

  async deleteRecord(rkey: string): Promise<void> {
    return await this.client.deleteRecord("fan.fics.work.comment", rkey);
  }
}

class ChapterWorkFicsFanClient {
  private readonly client: SlicesClient;

  constructor(client: SlicesClient) {
    this.client = client;
  }

  async getRecords(
    params?: {
      limit?: number;
      cursor?: string;
      where?: {
        [K in FanFicsWorkChapterSortFields | IndexedRecordFields]?:
          WhereCondition;
      };
      orWhere?: {
        [K in FanFicsWorkChapterSortFields | IndexedRecordFields]?:
          WhereCondition;
      };
      sortBy?: SortField<FanFicsWorkChapterSortFields>[];
    },
  ): Promise<GetRecordsResponse<FanFicsWorkChapter>> {
    return await this.client.getRecords("fan.fics.work.chapter", params);
  }

  async getRecord(
    params: GetRecordParams,
  ): Promise<RecordResponse<FanFicsWorkChapter>> {
    return await this.client.getRecord("fan.fics.work.chapter", params);
  }

  async countRecords(
    params?: {
      limit?: number;
      cursor?: string;
      where?: {
        [K in FanFicsWorkChapterSortFields | IndexedRecordFields]?:
          WhereCondition;
      };
      orWhere?: {
        [K in FanFicsWorkChapterSortFields | IndexedRecordFields]?:
          WhereCondition;
      };
      sortBy?: SortField<FanFicsWorkChapterSortFields>[];
    },
  ): Promise<CountRecordsResponse> {
    return await this.client.countRecords("fan.fics.work.chapter", params);
  }

  async createRecord(
    record: FanFicsWorkChapter,
    useSelfRkey?: boolean,
  ): Promise<{ uri: string; cid: string }> {
    return await this.client.createRecord(
      "fan.fics.work.chapter",
      record,
      useSelfRkey,
    );
  }

  async updateRecord(
    rkey: string,
    record: FanFicsWorkChapter,
  ): Promise<{ uri: string; cid: string }> {
    return await this.client.updateRecord(
      "fan.fics.work.chapter",
      rkey,
      record,
    );
  }

  async deleteRecord(rkey: string): Promise<void> {
    return await this.client.deleteRecord("fan.fics.work.chapter", rkey);
  }
}

class WorkFicsFanClient {
  readonly comment: CommentWorkFicsFanClient;
  readonly chapter: ChapterWorkFicsFanClient;
  private readonly client: SlicesClient;

  constructor(client: SlicesClient) {
    this.client = client;
    this.comment = new CommentWorkFicsFanClient(client);
    this.chapter = new ChapterWorkFicsFanClient(client);
  }

  async getRecords(
    params?: {
      limit?: number;
      cursor?: string;
      where?: {
        [K in FanFicsWorkSortFields | IndexedRecordFields]?: WhereCondition;
      };
      orWhere?: {
        [K in FanFicsWorkSortFields | IndexedRecordFields]?: WhereCondition;
      };
      sortBy?: SortField<FanFicsWorkSortFields>[];
    },
  ): Promise<GetRecordsResponse<FanFicsWork>> {
    return await this.client.getRecords("fan.fics.work", params);
  }

  async getRecord(
    params: GetRecordParams,
  ): Promise<RecordResponse<FanFicsWork>> {
    return await this.client.getRecord("fan.fics.work", params);
  }

  async countRecords(
    params?: {
      limit?: number;
      cursor?: string;
      where?: {
        [K in FanFicsWorkSortFields | IndexedRecordFields]?: WhereCondition;
      };
      orWhere?: {
        [K in FanFicsWorkSortFields | IndexedRecordFields]?: WhereCondition;
      };
      sortBy?: SortField<FanFicsWorkSortFields>[];
    },
  ): Promise<CountRecordsResponse> {
    return await this.client.countRecords("fan.fics.work", params);
  }

  async createRecord(
    record: FanFicsWork,
    useSelfRkey?: boolean,
  ): Promise<{ uri: string; cid: string }> {
    return await this.client.createRecord("fan.fics.work", record, useSelfRkey);
  }

  async updateRecord(
    rkey: string,
    record: FanFicsWork,
  ): Promise<{ uri: string; cid: string }> {
    return await this.client.updateRecord("fan.fics.work", rkey, record);
  }

  async deleteRecord(rkey: string): Promise<void> {
    return await this.client.deleteRecord("fan.fics.work", rkey);
  }
}

class FicsFanClient {
  readonly work: WorkFicsFanClient;
  private readonly client: SlicesClient;

  constructor(client: SlicesClient) {
    this.client = client;
    this.work = new WorkFicsFanClient(client);
  }
}

class FanClient {
  readonly fics: FicsFanClient;
  private readonly client: SlicesClient;

  constructor(client: SlicesClient) {
    this.client = client;
    this.fics = new FicsFanClient(client);
  }
}

export class AtProtoClient extends SlicesClient {
  readonly fan: FanClient;
  readonly oauth?: OAuthClient | AuthProvider;

  constructor(
    baseUrl: string,
    sliceUri: string,
    oauthClient?: OAuthClient | AuthProvider,
  ) {
    super(baseUrl, sliceUri, oauthClient);
    this.fan = new FanClient(this);
    this.oauth = oauthClient;
  }
}

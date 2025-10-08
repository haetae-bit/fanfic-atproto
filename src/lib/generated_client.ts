// Generated TypeScript client for AT Protocol records
// Generated at: 2025-10-08 17:59:49 UTC
// Lexicons: 4

/**
 * @example Usage
 * ```ts
 * import { AtProtoClient } from "./generated_client.ts";
 *
 * const client = new AtProtoClient(
 *   'https://api.slices.network',
 *   'at://did:plc:dg2qmmjic7mmecrbvpuhtvh6/network.slices.slice/3m2fpay6dw522'
 * );
 *
 * // Get records from the fan.fics.work.chapter collection
 * const records = await client.fan.fics.work.chapter.getRecords();
 *
 * // Get a specific record
 * const record = await client.fan.fics.work.chapter.getRecord({
 *   uri: 'at://did:plc:example/fan.fics.work.chapter/3abc123'
 * });
 *
 * // Get records with filtering and search
 * const filteredRecords = await client.fan.fics.work.chapter.getRecords({
 *   where: {
 *     text: { contains: "example search term" }
 *   }
 * });
 *
 * // Use slice-level methods for cross-collection queries with type safety
 * const sliceRecords = await client.network.slices.slice.getSliceRecords<FanFicsWorkChapter>({
 *   where: {
 *     collection: { eq: 'fan.fics.work.chapter' }
 *   }
 * });
 *
 * // Search across multiple collections using union types
 * const multiCollectionRecords = await client.network.slices.slice.getSliceRecords<FanFicsWorkChapter | AppBskyActorProfile>({
 *   where: {
 *     collection: { in: ['fan.fics.work.chapter', 'app.bsky.actor.profile'] },
 *     text: { contains: 'example search term' },
 *     did: { in: ['did:plc:user1', 'did:plc:user2'] }
 *   },
 *   limit: 20
 * });
 *
 * // Serve the records as JSON
 * Deno.serve(async () => new Response(JSON.stringify(records.records.map(r => r.value))));
 * ```
 */

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

export interface FanFicsWorkChapter {
  /** The work this chapter is associated with */
  work: string;
  /** A reference to this chapter */
  chapterRef?: ComAtprotoRepoStrongRef;
  title: string;
  /** You can add additional notes to a chapter. Typically, these are displayed before chapter content. Only limited HTML is allowed. */
  authorsNotes?: string;
  content:
    | FanFicsWorkChapter["ChapterText"]
    | FanFicsWorkChapter["LeafletDoc"]
    | FanFicsWorkChapter["BskyPost"]
    | { $type: string; [key: string]: unknown };
  /** You can add additional notes to a chapter. Typically, these are displayed after chapter content. Only limited HTML is allowed. */
  endNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type FanFicsWorkChapterSortFields =
  | "work"
  | "title"
  | "authorsNotes"
  | "endNotes"
  | "createdAt"
  | "updatedAt";

export interface FanFicsWorkChapterChapterText {
  text: string;
}

export interface FanFicsWorkChapterLeafletDoc {
  docRef: ComAtprotoRepoStrongRef;
}

export interface FanFicsWorkChapterBskyPost {
  postRef: ComAtprotoRepoStrongRef;
}

export interface FanFicsWork {
  uri?: string;
  author: string;
  title: string;
  /** Tags for content the work may be related to, for example 'fluff' or 'meta' */
  tags: string[];
  /** You can describe your work in a summary. Only limited HTML is allowed. */
  summary: string;
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
  readonly Main: FanFicsWorkChapter;
  readonly ChapterText: FanFicsWorkChapterChapterText;
  readonly LeafletDoc: FanFicsWorkChapterLeafletDoc;
  readonly BskyPost: FanFicsWorkChapterBskyPost;
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

class WorkFicsFanClient {
  readonly chapter: ChapterWorkFicsFanClient;
  readonly comment: CommentWorkFicsFanClient;
  private readonly client: SlicesClient;

  constructor(client: SlicesClient) {
    this.client = client;
    this.chapter = new ChapterWorkFicsFanClient(client);
    this.comment = new CommentWorkFicsFanClient(client);
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

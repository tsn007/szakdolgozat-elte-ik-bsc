import type { paths } from "../types/schema";
import { baseApi } from "./baseApi";

type ConversationResponse = paths["/api/chat/conversations/"]["get"]["responses"]["200"]["content"]["application/json"];
type MessageResponse =
    paths["/api/chat/conversations/{conversation_id}/messages/"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateMsgReq =
    paths["/api/chat/conversations/{conversation_id}/messages/"]["post"]["requestBody"]["content"]["application/json"];
type CreateMsgRequest = {
    convId: string;
    convInfo: CreateMsgReq;
};
type CreateMsgResp =
    paths["/api/chat/conversations/{conversation_id}/messages/"]["post"]["responses"]["201"]["content"]["application/json"];
type ReadResp =
    paths["/api/chat/conversations/{conversation_id}/read/"]["post"]["responses"]["200"]["content"]["application/json"];

export const chatApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUserConversations: builder.query<ConversationResponse, void>({
            query: () => ({
                url: "api/chat/conversations/",
                method: "GET",
            }),
        }),
        getConversationMessages: builder.query<MessageResponse, string>({
            query: (convId) => ({
                url: `api/chat/conversations/${convId}/messages/`,
                method: "GET",
            }),
            async onCacheEntryAdded(convId, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                const ws = new WebSocket(`ws://localhost:8080/ws/chat/${convId}/`);

                try {
                    await cacheDataLoaded;

                    ws.addEventListener("message", (event) => {
                        const data = JSON.parse(event.data);
                        const newMsg = data.message;

                        updateCachedData((draft) => {
                            if (data.type === "new_message") {
                                draft.results.push(newMsg);
                            } else if (data.type === "messages_read") {
                                draft.results.forEach((msg) => {
                                    if (msg.sender.email === data.reader_email) return;
                                    msg.is_read = true;
                                });
                            }
                        });
                    });
                } catch (e) {
                    console.log(e);
                }

                await cacheEntryRemoved;

                ws.close();
            },
        }),
        createMessage: builder.mutation<CreateMsgResp, CreateMsgRequest>({
            query: ({ convId, convInfo }) => ({
                url: `api/chat/conversations/${convId}/messages/`,
                method: "POST",
                body: convInfo,
            }),
        }),
        markAsRead: builder.mutation<ReadResp, string>({
            query: (convId) => ({
                url: `api/chat/conversations/${convId}/read/`,
                method: "POST",
            }),
        }),
    }),
});

export const {
    useGetUserConversationsQuery,
    useGetConversationMessagesQuery,
    useCreateMessageMutation,
    useMarkAsReadMutation,
} = chatApi;

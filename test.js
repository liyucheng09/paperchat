
import { ChatGPTUnofficialProxyAPI } from 'chatgpt'


const api = new ChatGPTUnofficialProxyAPI({
    accessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJsaXl1Y2hlbmcwOUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZ2VvaXBfY291bnRyeSI6IkdCIn0sImh0dHBzOi8vYXBpLm9wZW5haS5jb20vYXV0aCI6eyJ1c2VyX2lkIjoidXNlci1PTkdMM1BCdGRHajhtQ0xPQkdyMzVwbDAifSwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5vcGVuYWkuY29tLyIsInN1YiI6ImF1dGgwfDYzYjMxNTdmMzFkNWY5NWQ4OTRhMWNkZSIsImF1ZCI6WyJodHRwczovL2FwaS5vcGVuYWkuY29tL3YxIiwiaHR0cHM6Ly9vcGVuYWkub3BlbmFpLmF1dGgwYXBwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE2Nzc1MTU2NTIsImV4cCI6MTY3ODcyNTI1MiwiYXpwIjoiVGRKSWNiZTE2V29USHROOTVueXl3aDVFNHlPbzZJdEciLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG1vZGVsLnJlYWQgbW9kZWwucmVxdWVzdCBvcmdhbml6YXRpb24ucmVhZCBvZmZsaW5lX2FjY2VzcyJ9.Cp5yUJU6LZARjx9KBpKMRPZjVWGmNXzvOzdkkRjOHhtkxcuTnfPqawmcLMR5-cAjlpeLv5QqOGwoF-wXPiV99ZOYGjf-0ptd9YN49Moi3HLdvnakCxg3DtxRW6SbQ6olrrFAkV9QySetlfVKY8jCTtajHBB2FzGxdS2qFSOWa3mgIAyOxbZdpLNls6s5xQkC5GKh5EqaPlR9DPlf-RncKjT9qtQFIQWOsSFA0aoWZkMDAWIyRZbekgf61PZ9PN5Ola1ZF7DJZilBvDmfLGeV4HMIFPNr2x3X0OgV9ow204paMXnswTqsUmoObeJkuFa3Ymknz-CptFUEXyrns84kDw',
})

let res = await api.getConversations();
// try {
//     let res = await api.sendMessage('Hello World!', {conversationId: '0fa76ca0-433e-4b88-b9d0-a2a8f602b649',});
// } catch (e) {
//     console.log("Error Message: ", e.message)
// }
console.log(res)
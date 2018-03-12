# qnaclient
A free javascript client for Microsoft QNA Maker Bot Framework.
Requires JQuery 2.1.4 +

To implement, follow these steps:-

1. Create a folder at the root of your website called /qna .
2. Copy the files from https://github.com/garsidestephen/qnaclient into your qna folder (excluding the dev folder).
3. Add the following script tags to the bottom of your web page:

<script src="/qna/qna.min.js"></script>
<script>
    qnaClient.Init("Your QNA ocpApimSubscriptionKey", "Your QNA urlKey", { });
</script>

An example of initialising the qna bot client would be:-
qnaClient.Init("84969b11b88449beb0cf2768f7b07597", "a7054a6d-0f82-4d8c-a9ae-9e4dca2b945d", { });

Thats it for a standard implementation!

The following are the configuarble parameters for the qna client [and their defaults]:-

title: [empty string]
minimumAcceptableAnswerScore: [50]
botImageUrl: [empty string]
"pageContainerId": ""
"pageContainerClass": ""
"theme": "default"
"noAnswerPhrase": "Sorry, I don't understand."
"somethingGoneWrongPhrase": "Mmm, something went wrong there, try me again!"
"loggingEnabled": true
"displayImagesInline": false
"botPrimingPhrase": "Hi"
"logoUrl": "/qna/logo.png"
"buttonToolTip": "Start a chat"
"position": "bottom-left"
"inputPrompt": "What would you like to say?"
"busyMessage": "Hold on a mo..." 

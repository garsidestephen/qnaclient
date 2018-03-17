

# qnaClient
A free javascript client for Microsoft QNA Maker Bot Framework (Requires JQuery 2.1.4 +)


## Implementation
To implement, follow these 3 steps:-
1. Create a folder at the root of your website called /qna .

2. Copy the files from https://github.com/garsidestephen/qnaclient into your qna folder (excluding the dev folder).

3. Add the following script tags to your web page (at the bottom of your \<body> tag) and add your subscription and url keys:-

    \<script src="/qna/qna.min.js"></script>
    \<script>
    	qnaClient.Init("Your QNA ocpApimSubscriptionKey", "Your QNA urlKey", { });
    \</script>


## Initialising
The following is an example of initialising the qnaClient:-

    qnaClient.Init("84969b11b88449beb0cf2768f7b07597", "a7054a6d-0f82-4d8c-a9ae-9e4dca2b945d", {});

Thats it for a standard implementation!


## Configurable Parameters
The following are the configurable parameters for the **qnaClient**, together with their defaults and a brief explanation:-

**"title"** :  ""  -  Displayed in the header bar of the chat window

**"minimumAcceptableAnswerScore"** : "50"  -  Used to calculate whether the top answer returned by your bot is an acceptable response. If all answers returned have a lower score then the '**noAnswer**' phrase is displayed in the chat stream.

**"pageContainerId"** :  ""  -  If present, the qna client html will be injected into the dom element with this id.

**"pageContainerClass"** : ""  -  If present, the qna client html will be injected into the dom element with this class.

**"theme"** :  "default"  -  There is currently only 1 theme, however, more are planned, or you can easily create your own!

**"noAnswerPhrase"** : "Sorry I don't understand."  -  Works in conjunction with the '**minimumAcceptableAnswerScore**'. This is the phrase added to the chat stream if your bot cannot provide a suitable answer.

**"somethingGoneWrongPhrase"** : "Mmm, something went wrong there, try me again!"  -  If something goes wrong when communicating with your bot, this phrase is displayed in the chat stream.

**"loggingEnabled"** : true  -  If enabled, interactions and debug information is written to the console.

**"displayImagesInline"** : false  -  If set to true then Images returned in bot answers are displayed as block elements (i.e. on their own line). If false, then images are displayed inline (i.e. within the text).

**"botPrimingPhrase"** : "Hi"  -  When the qnaClient chat window first starts, this phrase is passed to your bot and the response is displayed in the chat stream.

**"logoUrl"** : "/qna/logo.png"  -  The url of the logo displayed in the top left of the chat window header. Image should be 50px x 50px and in .png format.

**"buttonToolTip"** : "Start a chat"  -  The tootltip to display when a user hovers over the chat launcher button.

**"position"** : "bottom-left"  -  The position of the chat launcher button and the chat window. Options are **bottom-left**, **bottom-right**, **top-left**, **top-right**.

**"inputPrompt"** : "What would you like to say?"  -  The placeholder text prompt displayed in the user input text box.

**"busyMessage"** : "Hold on a mo..."  -  The message displayed over the chat stream whilst a user question is submitted and a awaiting a response.


### Example of Parameter Use
    qnaClient.Init("84969b11b88449beb0cf2768f7b07597", "a7054a6d-0f82-4d8c-a9ae-9e4dca2b945d", { "theme" : "default", "title" : "Chat to Stephen Garside"});

### Include Chips
You can add chips to your responses to offer your users options to select rather than having to type. Read more about how to add chips to qna maker chat-bot.


### Read More
For more information on this free QNA Maker chatbot client and to see a demonstration of its implementation visit:-
http://www.stephengarside.co.uk/blog/webdev/create-a-simple-business-chatbot-with-microsoft-qna-maker/

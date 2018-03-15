// QNAClient - http://www.stephengarside.co.uk/blog/webdev/create-a-simple-business-chatbot-with-microsoft-qna-maker/

var qnaClient = (function () {
    var isBrowserSpeechRecognitionEnabled = false,
        isMobileDevice = (/Mobi/.test(navigator.userAgent)),
        screenHeight = $(window).height(),
        documentHeight = $(document).height(),
        $htmlBody = null,
        $stream = null,
        $streamWrap = null,
        $qna = null,
        $qnaBot = null,
        $input = null,
        $busy = null,
        $title = null,
        $logo = null,
        $closer = null,
        $launcher = null,
        $launcherImage = null,
        $busyMessage = null,
        fadeSpeed = 'fast',
        currentPageUrlPath = window.location.href.replace(window.location.origin, ""),
        ocp_Apim_Subscription_Key = null,
        qnaEndpoint = null,
        previousQuestions = [],
        previousQuestionsCurrentIndex = 0,
        unansweredQuestionsInThisSession = [],
        configurableParams = { "title": "", "minimumAcceptableAnswerScore": 50, "pageContainerId": "", "pageContainerClass": "", "theme": "default", "noAnswerPhrase": "Sorry, I don't understand.", "somethingGoneWrongPhrase": "Mmm, something went wrong there, try me again!", "loggingEnabled": true, "displayImagesInline": false, "botPrimingPhrase": "Hi", "logoUrl": "/qna/logo.png", "buttonToolTip": "Start a chat", "position": "bottom-left", "inputPrompt": "What would you like to say?", "busyMessage": "Hold on a mo...", "unansweredQuestionsEndpoint": "" };

    ///
    /// Init QNA Client
    ///
    var init = function (ocpApimSubscriptionKey, urlKey, params) {
        if (ocpApimSubscriptionKey == null || ocpApimSubscriptionKey == "" || urlKey == null || urlKey == "") {
            log("Missing OCPApimSubscriptionKey or UrlKey");
        }
        else {
            ocp_Apim_Subscription_Key = ocpApimSubscriptionKey;
            qnaEndpoint = `https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/${urlKey}/generateAnswer`;

            isBrowserSpeechRecognitionEnabled = window.hasOwnProperty('webkitSpeechRecognition') || window.hasOwnProperty('SpeechRecognition');

            setParameters(params);

            var callbackFn = function () {
                setTheme();
                initEvents();
                setBranding();
                start();
            };

            buildAndInsertBotHTML(callbackFn);
        }
    }

    ///
    /// Start QNA Client
    ///
    function start() {
        var callbackFn = function () {
            showQnaLauncher();
        };

        generateAnswer(configurableParams.botPrimingPhrase, 1, callbackFn);
    }

    ///
    /// Show Qna Bot
    ///
    function showQnaBot() {
        $qna.fadeIn(fadeSpeed);
        clearInputAndFocus();
    }

    ///
    /// Show Qna Launcher
    ///
    function showQnaLauncher() {
        $launcher.fadeIn(fadeSpeed);
    }

    ///
    /// Hide Qna Bot
    ///
    function hideQnaBot() {
        $qna.fadeOut(fadeSpeed);
    }

    ///
    /// Hide Qna Launcher
    ///
    function hideQnaLauncher() {
        $launcher.fadeOut(fadeSpeed);
    }

    ///
    /// Enable Unanswered Question Logging
    ///
    function registerUnansweredQuestions() {
        if (configurableParams.unansweredQuestionsEndpoint != null && configurableParams.unansweredQuestionsEndpoint.match(/(http(s?))\:\/\//gi)) {
            var unansweredQuestions = unansweredQuestionsInThisSession.join(' | ');
            $.post(configurableParams.unansweredQuestionsEndpoint, { UnansweredQuestion: unansweredQuestions });
        }
    }

    ///
    /// Clear Unanswered Questions In This Session
    /// 
    function clearUnansweredQuestionsInThisSession() {
        unansweredQuestionsInThisSession = [];
    }

    ///
    /// Init Events
    ///
    function initEvents() {
        $launcher.on('click', function () { hideQnaLauncher(); showQnaBot(); });

        $closer.on('click', function () {
            hideQnaBot();
            showQnaLauncher();
            registerUnansweredQuestions();
            clearUnansweredQuestionsInThisSession();
        });

        // Keypress on main input field
        $input.on('keydown', function (e) { checkInputKeyPress(e); });
    }

    ///
    /// Show Busy
    ///
    function showBusy(callbackFn) {
        var streamHeight = $stream.height(),
            streamWrapHeight = $streamWrap.height(),
            busyHeight = streamHeight < streamWrapHeight ? streamWrapHeight + 20 : streamHeight + 20;

        $busy.height(busyHeight);

        $busy.fadeIn("fast", function () {
            if (callbackFn) {
                callbackFn();
            }
        });
    }

    ///
    /// Hide Busy
    ///
    function hideBusy(callbackFn) {
        $busy.fadeOut("fast", function () {
            if (callbackFn) {
                callbackFn();
            }
        });
    }

    ///
    /// Check the keypress val on main input field
    ///
    function checkInputKeyPress(e) {
        if (e.which == 13) {
            // Enter has been pressed
            submitQuestion();
            return false;
        }

        if (e.which == 38) {
            // Up Key Pressed
            cyclePreviousQuestions(38);
            return false;
        }

        if (e.which == 40) {
            // Down Key Pressed
            cyclePreviousQuestions(40);
            return false;
        }
    }

    ///
    /// Submits a question
    ///
    function submitQuestion() {
        var question = $input.val();

        // Check we have some input
        if (question != null && question.length > 0) {
            previousQuestions.push(question);
            previousQuestionsCurrentIndex = previousQuestions.length + 1;

            updateStream(question);
            generateAnswer(question);
        }
    }

    ///
    /// Cycle Previous Questions
    ///
    function cyclePreviousQuestions(keyCode) {
        if (previousQuestions.length > 0) {
            if (keyCode == 38) {
                // Up
                previousQuestionsCurrentIndex = previousQuestionsCurrentIndex < 0 ? 0 : previousQuestionsCurrentIndex -= 1;
            }
            else if (keyCode == 40) {
                // Down                
                previousQuestionsCurrentIndex = previousQuestionsCurrentIndex > previousQuestions.length ? previousQuestions.length : previousQuestionsCurrentIndex += 1;
            }

            // Update Input with previous question
            $input.val(previousQuestions[previousQuestionsCurrentIndex - 1]);
        }
    }

    ///
    /// Reset Previous Questions Current Index
    ///
    function resetPreviousQuestionsCurrentIndex() {
        previousQuestionsCurrentIndex = previousQuestions.length > 0 ? previousQuestions.length - 1 : 0;
        return previousQuestionsCurrentIndex;
    }

    ///
    /// Clears main input box and sets focus
    ///
    function clearInputAndFocus() {
        $input.val("");
        $input.focus();
    }

    ///
    /// Set Parameters
    ///
    function setParameters(params) {
        if (params) {
            params.minimumAcceptableAnswerScore != null ? configurableParams.minimumAcceptableAnswerScore = params.minimumAcceptableAnswerScore : configurableParams.minimumAcceptableAnswerScore;
            params.theme != null ? configurableParams.theme = params.theme : configurableParams.theme;
            params.title != null ? configurableParams.title = params.title : configurableParams.title;
            params.pageContainerId != null ? configurableParams.pageContainerId = params.pageContainerId : configurableParams.pageContainerId;
            params.pageContainerClass != null ? configurableParams.pageContainerClass = params.pageContainerClass : configurableParams.pageContainerClass;
            params.noAnswerPhrase != null ? configurableParams.noAnswerPhrase = params.noAnswerPhrase : configurableParams.noAnswerPhrase;
            params.somethingGoneWrongPhrase != null ? configurableParams.somethingGoneWrongPhrase = params.somethingGoneWrongPhrase : configurableParams.somethingGoneWrongPhrase;
            params.displayImagesInline != null ? configurableParams.displayImagesInline = params.displayImagesInline : configurableParams.displayImagesInline;
            params.loggingEnabled != null ? configurableParams.loggingEnabled = params.loggingEnabled : configurableParams.loggingEnabled;
            params.botPrimingPhrase != null ? configurableParams.botPrimingPhrase = params.botPrimingPhrase : configurableParams.botPrimingPhrase;
            params.buttonToolTip != null ? configurableParams.buttonToolTip = params.buttonToolTip : configurableParams.buttonToolTip;
            params.inputPrompt != null ? configurableParams.inputPrompt = params.inputPrompt : configurableParams.inputPrompt;
            params.position != null ? configurableParams.position = params.position : configurableParams.position;
            params.logoUrl != null ? configurableParams.logoUrl = params.logoUrl : configurableParams.logoUrl;
            params.busyMessage != null ? configurableParams.busyMessage = params.busyMessage : configurableParams.busyMessage;
            params.unansweredQuestionsEndpoint != null ? configurableParams.unansweredQuestionsEndpoint = params.unansweredQuestionsEndpoint : configurableParams.unansweredQuestionsEndpoint;
        }
    }

    ///
    /// Log to console
    ///
    function log(message) {
        if (configurableParams.loggingEnabled === true) {
            console.log(message);
        }
    }

    ///
    /// Build And Insert HTML
    ///
    function buildAndInsertBotHTML(callbackFn) {
        $.get("/qna/qna.html", function (html) {
            $htmlBody = $('body');

            // Override dom location?
            if (configurableParams.pageContainerId != null && configurableParams.pageContainerId != "") {
                $domLocation = $('#' + configurableParams.pageContainerId);
            }
            else if (configurableParams.pageContainerClass != null && configurableParams.pageContainerClass != "") {
                $domLocation = $('.' + configurableParams.pageContainerClass);
            }
            else {
                $domLocation = $htmlBody;
            }

            $domLocation.append(html);

            getJQVars();

            if (callbackFn) {
                callbackFn();
            }
        });
    }

    ///
    /// Get Jquery vars
    ///
    function getJQVars() {
        $stream = $('.js-qna-bot__stream-wrap__stream');
        $streamWrap = $('.js-qna-bot__stream-wrap');
        $qna = $('.js-qna');
        $qnaBot = $('.js-qna-bot');
        $busy = $('.js-qna-bot__stream-wrap__busy');
        $title = $('.js-qna-bot__header__title');
        $logo = $('.js-qna-bot__header__logo');
        $closer = $('.js-qna-bot__header__close');
        $input = $('.js-qna-bot__input__text');
        $launcher = $('.js-qna-launcher');
        $launcherImage = $('.js-qna-launcher__button__image');
        $busyMessage = $('.js-qna-bot__stream-wrap__busy__wrap__message');
    }

    ///
    /// Set Branding
    ///
    function setBranding() {
        $title.text(configurableParams.title);
        $logo.attr('src', configurableParams.logoUrl);
        $launcherImage.attr('title', configurableParams.buttonToolTip);
        $input.attr('placeholder', configurableParams.inputPrompt);
        $busyMessage.text(configurableParams.busyMessage);
    }

    // Add Ocp-Apim-Subscription-Key as a header + key, set [{"key":"Content-Type","value":"application/json","description":""}]
    function generateAnswer(question, numberOfAnswers, callbackFn) {
        if (question != null && question != "") {
            var top = numberOfAnswers == null || numberOfAnswers == 0 ? 1 : numberOfAnswers;
            showBusy();

            $.ajax({
                type: "POST",
                url: qnaEndpoint,
                beforeSend: function (request) {
                    request.setRequestHeader("Ocp-Apim-Subscription-Key", ocp_Apim_Subscription_Key);
                },
                contentType: "application/json",
                data: JSON.stringify({
                    "question": question,
                    "top": top
                }),
                success: function (data) { parseResponse(data, question, callbackFn) },
                error: function (XMLHttpRequest, textStatus, errorThrown) { responseError(XMLHttpRequest, textStatus, errorThrown, callbackFn); }
            });
        }
    }

    ///
    /// Parse Response
    ///
    function parseResponse(data, originalQuestion, callbackFn) {
        hideBusy();
        var response = "";

        if (data != null && data.answers != null && data.answers.length > 0) {
            // We have at least one answer
            var topAnswer = data.answers[0];

            if (topAnswer.score > configurableParams.minimumAcceptableAnswerScore) {
                // Our top answer has a height over our acceptable score so show it
                var richMediaRegex = topAnswer.answer.match(/\[(.*?)\]\((.*?)\)/g);
                response = topAnswer.answer;

                if (richMediaRegex) {
                    response = transformRichMedia(topAnswer.answer, richMediaRegex);
                }
            }
            else {
                // None of our answers are over the acceptable score
                // so display our 'no answer' phrase
                response = configurableParams.noAnswerPhrase;

                // Log the fact this question could not be answered
                unansweredQuestionsInThisSession.push(originalQuestion);
            }

            log(`Top Answer: ${topAnswer.answer} | Score: ${topAnswer.score}`);
        }
        else {
            response = configurableParams.somethingGoneWrongPhrase;
        }

        clearInputAndFocus();

        updateStream(response, true);

        if (callbackFn) {
            callbackFn();
        }
    }

    ///
    /// Transform Rich Media Into HTML
    ///
    function transformRichMedia(text, richMedia) {
        for (var i = 0; i < richMedia.length; i++) {
            var richMediaElements = richMedia[i].split("]("),
                richMediaText = richMediaElements[0].replace(/\[|\]/g, ""),
                richMediaLink = richMediaElements[1].replace(/\(|\)/g, ""),
                imageBreak = !configurableParams.displayImagesInline ? "<br/>" : "";

            if (richMediaText.length && richMediaLink.length) {
                if (richMediaLink.match(/\.(gif|jpg|jpeg|tiff|png)$/i)) {
                    // Asset is an Image         
                    text = text.replace(`[${richMediaText}]`, ""); // Remove Text
                    text = text.replace(`(${richMediaLink})`, `${imageBreak}<img src='${richMediaLink}' alt='${richMediaText}' class='qna-bot__stream-wrap__stream__interaction__speech__media-asset'/>${imageBreak}`);
                }
                else if (richMediaLink.match(/(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/embed\/.+/i)) {
                    // Asset is a youtube video
                    text = text.replace(`[${richMediaText}]`, `${richMediaText}`); // Replace Text
                    text = text.replace(`(${richMediaLink})`, `${imageBreak}<iframe width='300' height='170' src='${richMediaLink}' frameborder='0' class='qna-bot__stream-wrap__stream__interaction__speech__media-asset' allow='autoplay; encrypted-media' allowfullscreen></iframe>${imageBreak}`);
                }
                else {
                    // Asset is a Link
                    text = text.replace(`[${richMediaText}]`, ""); // Remove Text
                    text = text.replace(`(${richMediaLink})`, `<a href='${richMediaLink}'>${richMediaText}</a>`);
                }
            }
        }

        return text;
    }

    ///
    /// Deal with Error Response
    ///
    function responseError(XMLHttpRequest, textStatus, errorThrown) {
        log(textStatus);
        clearInputAndFocus();
        updateStream(configurableParams.somethingGoneWrongPhrase, true);
        hideBusy();
    }

    ///
    /// Update Chat Stream
    ///
    function updateStream(content, isFromBot) {
        var html = "";

        if (isFromBot) {
            var dateTime = formatDate(new Date());
            html = `<div class='qna-bot__stream-wrap__stream__interaction qna-bot__stream-wrap__stream__interaction--from-bot'><p class='qna-bot__stream-wrap__stream__interaction__speech'>${content}<span class='qna-bot__stream-wrap__stream__date-time'>${dateTime}</span></p><div class='qna-bot__stream-wrap__stream__interaction__arrow-right'></div></div>`
        }
        else {
            html = `<div class='qna-bot__stream-wrap__stream__interaction qna-bot__stream-wrap__stream__interaction--from-user'><div class='qna-bot__stream-wrap__stream__interaction__arrow-left'></div><p class='qna-bot__stream-wrap__stream__interaction__speech'>${content}</p></div>`
        }

        $stream.append(html);

        scrollStreamToEnd();
    }

    ///
    /// Scroll Stream To End
    ///
    function scrollStreamToEnd() {
        window.setTimeout(function () {
            $streamWrap.scrollTop($streamWrap[0].scrollHeight);
        }, 0);
    }

    ///
    /// Set Theme
    ///
    function setTheme() {
        var themeName = `qna-theme--${configurableParams.theme}`,
            positionName = `qna-position--${configurableParams.position}`;

        $qna.addClass(themeName).addClass(positionName);
        $launcher.addClass(themeName).addClass(positionName);
    }

    ///
    /// Format Date
    /// 
    function formatDate(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return date.getDate() + "/" + date.getMonth() + 1 + "/" + date.getFullYear() + "  " + strTime;
    }

    return {
        Init: function (ocpApimSubscriptionKey, urlKey, params) { init(ocpApimSubscriptionKey, urlKey, params); }
    }
})();

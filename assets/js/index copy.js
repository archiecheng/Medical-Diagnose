document.addEventListener("DOMContentLoaded", function () {
  var isMobile = false;
  // 检测网页是否在移动端打开
  if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
    isMobile = true;
  }

  if (isMobile) {
    $(".chat_content").addClass("content_show");
    $(".result_content").addClass("content_hidden");
    $(".selected_symptom").addClass("content_hidden");
    $(".preview").removeClass("content_hidden").addClass("content_show");
  }

  // 在页面加载后自动聚焦到输入框
  const messageInput = document.getElementById("send_message_content");
  messageInput.focus();

  // 预加载疾病JSON数据
  var diseasesData = [];

  fetch("assets/data/diseases.json")
    .then((response) => response.json())
    .then((data) => {
      diseasesData = data;
    })
    .catch((error) => {
      console.error("Error loading JSON:", error);
    });

  // 预加载症状JSON数据
  var symptomsData = [];

  fetch("assets/data/symptoms.json")
    .then((response) => response.json())
    .then((data) => {
      symptomsData = data;
    })
    .catch((error) => {
      console.error("Error loading JSON:", error);
    });

  // 1. 侧边栏切换功能
  function toggleSidebar(toggleButtonSelector, sidebarSelector) {
    $(document).ready(function () {
      $(toggleButtonSelector).click(function () {
        $(sidebarSelector).toggleClass("hidden");
      });
    });
  }

  // 2. 发送消息功能
  function sendMessage(chatContainerId, buttonId, messageInputId) {
    var send_message = document.getElementById(chatContainerId);
    var domBtm = document.getElementById(buttonId);
    var message = document.getElementById(messageInputId);

    // 按钮点击事件
    domBtm.addEventListener("click", function () {
      send(send_message, message);
    });

    // 输入框回车键事件
    message.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        send(send_message, message);
      }
    });
  }

  // 发送消息函数
  function send(send_message, message) {
    var str = message.value;
    if (str.trim() === "") {
      alert("Send message empty");
      return;
    }

    appendUserMessage(send_message, str);
    message.value = "";
    send_message.scrollTop = send_message.scrollHeight;

    clearDiseaseCards();

    setTimeout(() => processMessage(str, send_message), 1000);
  }

  // 追加用户消息到聊天框
  function appendUserMessage(send_message, text) {
    var ans =
      '<div class="message_right_item">' +
      '<div class="message_right_content">' +
      text +
      "</div>" +
      '<div class="message_right_avatar">' +
      '<img src="./assets/images/avatar.png" alt="">' +
      " </div>" +
      "</div>";

    var oLi = document.createElement("div");
    oLi.setAttribute("class", "message_right");
    oLi.innerHTML = ans;
    send_message.append(oLi);

    setTimeout(() => {
      oLi.classList.add("fade-in");
    }, 10);
  }

  // 清空右侧旧的疾病卡片
  function clearDiseaseCards() {
    const resultContentContainer = document.querySelector(".result_content");
    resultContentContainer.innerHTML = "";
  }

  // 处理用户输入的信息
  function processMessage(text, send_message) {
    var symptoms = getDiseaseSymptoms(text);

    if (symptoms) {
      var replyMessage = generateReplyMessage(symptoms);
      appendReplyMessage(send_message, replyMessage);
      send_message.scrollTop = send_message.scrollHeight;

      setTimeout(() => renderSymptomsByDiseaseName(text, symptoms), 1000);
    } else {
      var replyMessage = "No information available for this disease.";
      appendReplyMessage(send_message, replyMessage);
      send_message.scrollTop = send_message.scrollHeight;
    }
  }

  // 根据疾病名称获取症状
  function getDiseaseSymptoms(diseaseName) {
    return diseasesData[diseaseName] ? diseasesData[diseaseName].Symptom : null;
  }

  // 生成回复消息
  function generateReplyMessage(symptoms) {
    var msg = "";
    if (symptoms) {
      msg = "Thank you for your message, we are searching now!";
      if (isMobile) {
        $(".chat_content")
          .removeClass("content_show")
          .addClass("content_hidden");
        $(".result_content")
          .removeClass("content_hidden")
          .addClass("content_show");
      }
    } else {
      msg = "No relevant symptoms found, please check the disease name.";
    }
    return msg;
  }

  // 追加回复消息到聊天框
  function appendReplyMessage(send_message, text) {
    var replyLi = document.createElement("div");
    replyLi.setAttribute("class", "message_left_item new");
    replyLi.innerHTML =
      '<div class="message_left_item">' +
      '<div class="message_left_content">' +
      text +
      "</div>" +
      "</div>";

    send_message.append(replyLi);

    setTimeout(() => {
      replyLi.classList.add("fade-in");
    }, 10);

    setTimeout(() => {
      replyLi.classList.remove("new");
    }, 500);
  }

  // 3. 根据疾病名称创建卡片并渲染症状
  function renderSymptomsByDiseaseName(diseaseName, symptoms) {
    createResultCard(diseaseName, symptoms);
  }

  // 4. 创建卡片并绑定滚动事件
  function createResultCard(diseaseName, symptoms, isPredicted = false) {
    const resultContentContainer = document.querySelector(".result_content");

    const resultCard = document.createElement("div");
    resultCard.classList.add("result_card", "new");

    const resultHeader = document.createElement("div");
    resultHeader.classList.add("result_header");

    if (isPredicted) {
      resultHeader.innerHTML = `Predicted Disease: ${diseaseName}`;
    } else {
      resultHeader.innerHTML = `Disease: ${diseaseName}`;
    }
    resultCard.appendChild(resultHeader);

    const resultMain = document.createElement("div");
    resultMain.classList.add("result_main");
    resultCard.appendChild(resultMain);

    const resultBriefIntro = document.createElement("div");
    resultBriefIntro.classList.add("result_brief_intro");
    resultBriefIntro.textContent = `Brief Explanation about ${diseaseName}...`;
    resultMain.appendChild(resultBriefIntro);

    const resultImage = document.createElement("div");
    resultImage.classList.add("result_image");
    const img = document.createElement("img");
    img.src = `./assets/images/disease.png`;
    img.alt = diseaseName;
    resultImage.appendChild(img);
    resultMain.appendChild(resultImage);

    const splitLine = document.createElement("div");
    splitLine.classList.add("split_line");
    resultMain.appendChild(splitLine);

    const symptomInfo = document.createElement("div");
    symptomInfo.classList.add("symptom_info");
    resultMain.appendChild(symptomInfo);

    const symptomIntro = document.createElement("div");
    symptomIntro.classList.add("symptom_intro");
    symptomIntro.textContent =
      "For the following symptoms, please select YES|NO|MAYBE according to your personal wellbeing";
    symptomInfo.appendChild(symptomIntro);

    const symptomListContainer = document.createElement("div");
    symptomListContainer.classList.add("symptom_list");
    symptomInfo.appendChild(symptomListContainer);

    // 生成唯一ID前缀
    const cardIdPrefix = `${diseaseName}_${new Date().getTime()}`;

    symptoms.forEach((symptom, index) => {
      const symptomItem = document.createElement("div");
      symptomItem.classList.add("simptom_item");

      const symptomName = `${symptom.SymptomName.replace(
        /\s+/g,
        "_"
      )}_${index}`;
      const uniqueSymptomId = `${cardIdPrefix}_${symptomName}`;

      symptomItem.innerHTML = `
<div class="symptom_name">${symptom.SymptomName}</div>
<div class="symptom_status">
<input type="radio" id="${uniqueSymptomId}_yes" name="${uniqueSymptomId}" value="yes" />
<label for="${uniqueSymptomId}_yes"></label>

<input type="radio" id="${uniqueSymptomId}_maybe" name="${uniqueSymptomId}" value="maybe" />
<label for="${uniqueSymptomId}_maybe"></label>

<input type="radio" id="${uniqueSymptomId}_no" name="${uniqueSymptomId}" value="no" />
<label for="${uniqueSymptomId}_no"></label>
</div>
`;
      symptomListContainer.appendChild(symptomItem);
    });

    const scrollArrow = document.createElement("div");
    scrollArrow.classList.add("scroll_arrow");
    resultCard.appendChild(scrollArrow);

    resultContentContainer.appendChild(resultCard);

    // 禁止页面滚动的函数
    function preventScroll(e) {
      e.stopPropagation();
    }

    // 监听鼠标进入症状列表区域事件
    symptomListContainer.addEventListener("mouseenter", function (e) {
      if (
        symptomListContainer.scrollHeight > symptomListContainer.clientHeight
      ) {
        document.addEventListener("wheel", preventScroll, { passive: false });
      }
    });

    symptomListContainer.addEventListener("mouseleave", function () {
      document.removeEventListener("wheel", preventScroll);
    });

    symptomListContainer.addEventListener(
      "wheel",
      function (e) {
        if (
          symptomListContainer.scrollHeight > symptomListContainer.clientHeight
        ) {
          e.stopPropagation();
        }
      },
      { passive: false }
    );

    symptomListContainer.addEventListener("touchstart", function (e) {
      const initialY = e.touches[0].clientY;

      function onTouchMove(e) {
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - initialY;

        if (
          symptomListContainer.scrollHeight > symptomListContainer.clientHeight
        ) {
          if (
            (deltaY > 0 && symptomListContainer.scrollTop === 0) ||
            (deltaY < 0 &&
              symptomListContainer.scrollTop +
                symptomListContainer.clientHeight ===
                symptomListContainer.scrollHeight)
          ) {
            return;
          }
          e.preventDefault();
        }
      }

      symptomListContainer.addEventListener("touchmove", onTouchMove);

      symptomListContainer.addEventListener("touchend", function () {
        symptomListContainer.removeEventListener("touchmove", onTouchMove);
      });
    });

    setTimeout(() => {
      resultCard.classList.add("fade-in");
    }, 10);

    setTimeout(() => {
      resultCard.classList.remove("new");
    }, 500);
  }

  // 5. 获取用户选择结果的函数
  function getUserSelections() {
    // 获取所有的症状项
    const symptomItems = document.querySelectorAll(".simptom_item");
    const userSelections = {};
    let allSelected = true;

    symptomItems.forEach((item) => {
      // 获取当前症状名称
      const symptomName = item.querySelector(".symptom_name").textContent;

      // 找到当前症状下用户选择的radio按钮
      const selectedOption = item.querySelector('input[type="radio"]:checked');

      // 获取选中的值（yes, no, maybe）
      const selectedValue = selectedOption ? selectedOption.value : null;

      // 将结果存储在对象中，键是症状名称，值是用户的选择
      userSelections[symptomName] = selectedValue;

      // 如果有未选择的选项，设置 allSelected 为 false
      if (!selectedValue) {
        allSelected = false;
      }
    });

    let symptomsArray = Object.keys(userSelections).map((key) => {
      return {
        symptomName: key,
        symptomChoice: userSelections[key],
      };
    });

    if (allSelected) {
      renderSymptomProfileList(symptomsArray);
    }

    return { userSelections, allSelected };
  }

  // 6. 症状匹配评分
  function calculateDiseaseScores(userSelections, diseasesData) {
    // 存储每个疾病的匹配分数
    const diseaseScores = {};

    // 遍历所有疾病
    for (const [diseaseName, diseaseInfo] of Object.entries(diseasesData)) {
      // 初始化当前疾病的匹配分数
      let score = 0;
      // 遍历当前疾病关联的所有症状
      diseaseInfo.Symptom.forEach((symptomInfo) => {
        const symptomName = symptomInfo.SymptomName;
        const symptomPossibility = symptomInfo.Possibility;
        if (userSelections[symptomName] != undefined) {
          // 根据症状名称从用户选择中获取用户的选择
          const userChoice = userSelections[symptomName];
          if (userChoice === "yes") {
            score += symptomPossibility;
          } else if (userChoice === "maybe") {
            score += symptomPossibility * 0.5;
          } else if (userChoice === "no") {
            return; // no 意味着没有这个症状，就是 0
          }
        }
      });
      // 将当前疾病的最终得分存储到 diseaseScores 对象中
      diseaseScores[diseaseName] = score;
    }
    // 返回包含所有疾病匹配分数的对象
    return diseaseScores;
  }

  // 7. 关联症状到其他可能的疾病
  function findRelatedDiseases(userSelections, symptomsData) {
    // 存储相关疾病及其累积的可能性分数
    const relatedDiseases = {};
    // 遍历用户对症状的选择
    for (const [symptomName, choice] of Object.entries(userSelections)) {
      // 仅处理用户选择为 "yes" 或 "maybe" 的症状
      if (choice === "yes" || choice === "maybe") {
        // 从 symptomsData 中获取与当前症状相关的疾病信息
        const symptomInfo = symptomsData[symptomName];

        // 如果症状信息存在，则处理关联的疾病
        if (symptomInfo) {
          // 遍历当前症状关联的每个疾病
          symptomInfo.diseases.forEach((disease) => {
            // 如果疾病还没有记录在 relatedDiseases 中，则初始化为 0
            if (!relatedDiseases[disease.DiseaseName]) {
              relatedDiseases[disease.DiseaseName] = 0;
            }
            // 根据用户选择累积该疾病的可能性分数
            // "yes" 累积全额的可能性分数，"maybe" 累积一半的可能性分数
            relatedDiseases[disease.DiseaseName] +=
              disease.possibility * (choice === "yes" ? 1 : 0.5);
          });
        }
      }
    }
    // 返回包含所有相关疾病及其累积分数的对象
    return relatedDiseases;
  }

  // 8. 疾病排序与筛选
  function combineAndRankDiseases(
    diseaseScores,
    relatedDiseases,
    initialDisease
  ) {
    const combinedScores = { ...diseaseScores };

    for (const [diseaseName, score] of Object.entries(relatedDiseases)) {
      if (combinedScores[diseaseName]) {
        combinedScores[diseaseName] += score;
      } else {
        combinedScores[diseaseName] = score;
      }
    }

    return Object.entries(combinedScores)
      .filter(([diseaseName]) => diseaseName !== initialDisease)
      .sort((a, b) => b[1] - a[1])
      .map(([diseaseName, score]) => ({ diseaseName, score }));
  }

  // 9. 迭代更新
  let predictionCount = 0;
  let finalResults = [];
  function onCardSwipe(
    userSelections,
    diseasesData,
    symptomsData,
    initialDisease
  ) {
    const diseaseScores = calculateDiseaseScores(userSelections, diseasesData);

    const relatedDiseases = findRelatedDiseases(userSelections, symptomsData);

    const rankedDiseases = combineAndRankDiseases(
      diseaseScores,
      relatedDiseases,
      initialDisease
    );

    if (rankedDiseases.length > 0) {
      // 找到第一个未在finalResults中出现的疾病
      let topDisease;
      for (const disease of rankedDiseases) {
        const isAlreadyPredicted = finalResults.some(
          (result) => result.diseaseName === disease.diseaseName
        );
        if (!isAlreadyPredicted) {
          topDisease = disease;
          break;
        }
      }

      // 如果找到未重复的疾病
      if (topDisease) {
        // 获取当前疾病的症状并将用户的选择记录下来
        const symptoms = diseasesData[topDisease.diseaseName].Symptom.map(
          (symptomInfo) => {
            return {
              SymptomName: symptomInfo.SymptomName,
              choice: userSelections[symptomInfo.SymptomName] || "no",
            };
          }
        );

        // 将疾病和症状信息一起推入 finalResults
        finalResults.push({
          diseaseName: topDisease.diseaseName,
          score: topDisease.score,
          symptoms: symptoms,
        });

        // 创建结果卡片
        createResultCard(
          topDisease.diseaseName,
          symptoms, // 直接传递症状列表
          true
        );

        predictionCount++;

        if (predictionCount === 5) {
          if (isMobile) {
            $(".result_content")
              .removeClass("content_show")
              .addClass("content_hidden");
            $(".selected_symptom")
              .removeClass("content_hidden")
              .addClass("content_show");
          } else {
            generateFinalReport(finalResults);
          }
        }
      } else {
        console.log("No new unique diseases to predict.");
      }
    }
  }

  let allSymptoms = [];
  let uniqueSymptoms = [];
  function renderSymptomProfileList(symptomResults) {
    const selectedSymptomListContainer = document.querySelector(
      ".selected_symptom_list"
    );
    selectedSymptomListContainer.innerHTML = "";
    for (let i = 0; i < symptomResults.length; i++) {
      allSymptoms.push({
        symptomName: symptomResults[i].symptomName,
        symptomChoice: symptomResults[i].symptomChoice,
      });
    }

    uniqueSymptoms = allSymptoms.filter(
      (symptom, index, self) =>
        index === self.findIndex((s) => s.symptomName === symptom.symptomName)
    );
    uniqueSymptoms.forEach((symptom, index) => {
      const symptomItem = createSymptomItem(symptom, index, uniqueSymptoms);
      selectedSymptomListContainer.appendChild(symptomItem);
    });
  }

  function createSymptomItem(symptom, index, uniqueSymptoms) {
    const symptomItem = document.createElement("div");
    symptomItem.classList.add("selected_symptom_item");

    const symptomName = document.createElement("div");
    symptomName.textContent = symptom.symptomName;

    const removeBtn = document.createElement("div");
    const removeImg = document.createElement("img");
    removeImg.src = "./assets/images/remove.png";
    removeImg.alt = "Remove Symptom";

    removeImg.addEventListener("click", () => {
      removeSymptom(index, uniqueSymptoms);
    });

    removeBtn.appendChild(removeImg);

    symptomItem.appendChild(symptomName);
    symptomItem.appendChild(removeBtn);

    return symptomItem;
  }

  function removeSymptom(index, uniqueSymptoms) {
    uniqueSymptoms.splice(index, 1);
    renderSymptoms(uniqueSymptoms);
  }

  function renderSymptoms(symptoms) {
    const selectedSymptomListContainer = document.querySelector(
      ".selected_symptom_list"
    );
    selectedSymptomListContainer.innerHTML = "";

    symptoms.forEach((symptom, index) => {
      const symptomItem = createSymptomItem(symptom, index, symptoms);
      selectedSymptomListContainer.appendChild(symptomItem);
    });
  }

  function renderFilteredSymptoms(choice) {
    const selectedSymptomListContainer = document.querySelector(
      ".selected_symptom_list"
    );
    selectedSymptomListContainer.innerHTML = "";
    var filteredSymptoms = uniqueSymptoms.filter(
      (symptom) => symptom.symptomChoice === choice
    );

    filteredSymptoms.forEach((symptom, index) => {
      const symptomItem = createSymptomItem(symptom, index);
      selectedSymptomListContainer.appendChild(symptomItem);
    });
  }

  function generateFinalReport(finalResults) {
    localStorage.setItem("finalResults", JSON.stringify(finalResults));
    localStorage.setItem("uniqueSymptoms", JSON.stringify(uniqueSymptoms));
    window.location.href = `pdf.html`;
  }

  // 滚动停顿功能
  let isScrolling = false;
  let lastScrollTime = 0;
  const resultContent = document.querySelector(".result_content");

  function scrollToCard(targetCard) {
    isScrolling = true;
    targetCard.scrollIntoView({ behavior: "smooth" });

    setTimeout(() => {
      isScrolling = false;
    }, 1000);
  }

  function handleScroll(event) {
    if (isScrolling) {
      return;
    }

    const currentTime = new Date().getTime();
    if (currentTime - lastScrollTime < 1000) {
      event.preventDefault();
      return;
    }

    lastScrollTime = currentTime;

    const { userSelections, allSelected } = getUserSelections();

    if (!allSelected) {
      event.preventDefault();
      alert("Please select an option for each symptom before proceeding.");
      return;
    }

    const resultCards = document.querySelectorAll(".result_card");

    let scrollDirection = event.deltaY < 0 ? "up" : "down";

    let closestCard = resultCards[0];
    let minDistance = Math.abs(closestCard.getBoundingClientRect().top);

    resultCards.forEach((card) => {
      const distance = Math.abs(card.getBoundingClientRect().top);
      if (distance < minDistance) {
        minDistance = distance;
        closestCard = card;
      }
    });

    let targetCard = closestCard;
    if (scrollDirection === "down") {
      const nextCard = closestCard.nextElementSibling;
      if (nextCard && nextCard.classList.contains("result_card")) {
        targetCard = nextCard;
      }
    } else {
      const prevCard = closestCard.previousElementSibling;
      if (prevCard && prevCard.classList.contains("result_card")) {
        targetCard = prevCard;
      }
    }

    const initialDisease = document
      .querySelector(".result_card .result_header")
      .textContent.replace("Disease: ", "");
    onCardSwipe(userSelections, diseasesData, symptomsData, initialDisease);

    const newResultCards = document.querySelectorAll(".result_card");
    if (newResultCards.length > resultCards.length) {
      targetCard = newResultCards[newResultCards.length - 1];
    }

    scrollToCard(targetCard);
  }

  resultContent.addEventListener("wheel", function (event) {
    event.preventDefault();
    handleScroll(event);
  });

  var selected_symptom_yes = document.getElementById("selected_symptom_yes");
  selected_symptom_yes.addEventListener("click", function () {
    if (uniqueSymptoms.length == 0) {
      alert("the symptoms list is null, we cannot filter");
      return;
    }
    renderFilteredSymptoms("yes");
  });
  var selected_symptom_maybe = document.getElementById(
    "selected_symptom_maybe"
  );
  selected_symptom_maybe.addEventListener("click", function () {
    if (uniqueSymptoms.length == 0) {
      alert("the symptoms list is null, we cannot filter");
      return;
    }
    renderFilteredSymptoms("maybe");
  });
  var selected_symptom_no = document.getElementById("selected_symptom_no");
  selected_symptom_no.addEventListener("click", function () {
    if (uniqueSymptoms.length == 0) {
      alert("the symptoms list is null, we cannot filter");
      return;
    }
    renderFilteredSymptoms("no");
  });

  var preview_report = document.getElementById("preview_report");
  preview_report.addEventListener("click", function () {
    generateFinalReport(finalResults);
  });

  sendMessage("message_list_id", "button", "send_message_content");
  toggleSidebar("#toggleButton", "#sidebar");
});

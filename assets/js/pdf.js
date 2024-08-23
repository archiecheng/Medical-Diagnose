document.addEventListener("DOMContentLoaded", function () {
  // 获取 finalResults 数据
  const finalResults = JSON.parse(localStorage.getItem("finalResults"));
  const uniqueSymptoms = JSON.parse(localStorage.getItem("uniqueSymptoms"));
  // 渲染症状到 Symptom Profile 区域
  renderSymptomProfile(finalResults, uniqueSymptoms);

  // 渲染疾病匹配到 Disease Matches 区域
  renderDiseaseMatches(finalResults, uniqueSymptoms);

  if (typeof window.jspdf !== "undefined") {
    console.log("jsPDF loaded correctly");
    window.jsPDF = window.jspdf.jsPDF;
  } else {
    console.error("jsPDF failed to load");
  }

  // 下载 PDF
  $("#downloadPDF").click(function () {
    console.log("开始下载PDF");
    htmlToPdf();
  });
});

function htmlToPdf() {
  // 获取HTML元素
  const element = document.getElementById("layout_wrapper");
  const options = {
    dpi: 300, //dpi属性的值为192，表示图像的分辨率
    scale: 3, //scale属性的值为2，表示图像的缩放比例。
    windowWidth: element.scrollWidth, // 确保宽度覆盖整个页面
    windowHeight: element.scrollHeight, // 增加高度覆盖页面内容及额外空间
    backgroundColor: "#F1F6FE", //backgroundColor属性的值为"#F1F6FE"，表示图像的背景颜色。
  };
  // 将元素转换为canvas对象
  html2canvas(element, options).then((canvas) => {
    var contentWidth = canvas.width; //获取Canvas(上面元素id 'layout-wrapper')对象的宽度
    var contentHeight = canvas.height; //获取Canvas(上面元素id 'layout-wrapper')对象的高度
    // 创建jsPDF对象
    window.jsPDF = window.jspdf.jsPDF; //导入jsPDF库，用于创建PDF文件
    const pdf = new jsPDF("landscape", "px", [contentWidth, contentHeight]); //创建一个新的PDF对象，参数包括页面格式（'1'表示A4纸张）、单位（'pt'）和页面尺寸（[contentWidth, contentHeight]）
    var pageData = canvas.toDataURL("image/jpeg", 1.0); //将Canvas对象转换为JPEG格式的数据，并将其存储在pageData变量中。1.0表示图片质量
    pdf.addImage(pageData, "JPEG", 0, 0, contentWidth, contentHeight); //将JPEG格式的图片添加到PDF文件中，图片的左上角坐标为(0, 0)，宽度为contentWidth，高度为contentHeight
    pdf.save("report.pdf");
  });
}

// var count = 0;
function renderSymptomProfile(finalResults, uniqueSymptoms) {
  const occurSymptoms = new Set();
  const unsureSymptoms = new Set();
  finalResults.forEach((result) => {
    result.symptoms.forEach((symptom) => {
      // console.log(symptom);
      for (let i = 0; i < uniqueSymptoms.length; i++) {
        if (symptom.SymptomName == uniqueSymptoms[i].symptomName) {
          // count++;
          if (symptom.choice === "yes") {
            occurSymptoms.add(symptom.SymptomName); // 使用 Set 来自动去重
          } else if (symptom.choice === "maybe") {
            unsureSymptoms.add(symptom.SymptomName); // 使用 Set 来自动去重
          }
        }
      }
    });
  });

  // 将症状列表渲染到对应的表格单元格中
  document.querySelector(
    ".profile tr:nth-child(2) td:nth-child(2)"
  ).textContent = Array.from(occurSymptoms).join(", ");
  document.querySelector(
    ".profile tr:nth-child(3) td:nth-child(2)"
  ).textContent = Array.from(unsureSymptoms).join(", ");
  // console.log(count)
}

function renderDiseaseMatches(finalResults, uniqueSymptoms) {
  // 按匹配度将 finalResults 分类
  const matches85_100 = [];
  const matches70_85 = [];
  const matches55_70 = [];
  const matches40_55 = [];
  const matchesBelow40 = [];

  finalResults.forEach((result) => {
    if (result.score >= 0.85) {
      matches85_100.push(result.diseaseName);
    } else if (result.score >= 0.7) {
      matches70_85.push(result.diseaseName);
    } else if (result.score >= 0.55) {
      matches55_70.push(result.diseaseName);
    } else if (result.score >= 0.4) {
      matches40_55.push(result.diseaseName);
    } else {
      matchesBelow40.push(result.diseaseName);
    }
  });

  // 渲染疾病名称到相应的匹配区域
  document.querySelector(
    ".disease_match:nth-child(2) .disease_match_main"
  ).textContent = matches85_100.join(", ");
  document.querySelector(
    ".disease_match:nth-child(3) .disease_match_main"
  ).textContent = matches70_85.join(", ");
  document.querySelector(
    ".disease_match:nth-child(4) .disease_match_main"
  ).textContent = matches55_70.join(", ");
  document.querySelector(
    ".disease_match:nth-child(5) .disease_match_main"
  ).textContent = matches40_55.join(", ");
  document.querySelector(
    ".disease_match:nth-child(6) .disease_match_main"
  ).textContent = matchesBelow40.join(", ");
}

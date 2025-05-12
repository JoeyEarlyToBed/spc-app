// spc-utils.js
// SPC 分析工具公共函数库

// --- 常量 ---

/**
 * Xbar-R 和 Xbar-S 控制图常用常数
 * Key: n (子组大小)
 * Values: { A2, A3, B3, B4, D3, D4, d2, c4 }
 * 注意: A3, B3, B4 是用于 S 图的常数，也包含在此处以便扩展
 */
const CONTROL_CHART_CONSTANTS = {
    2: { A2: 1.880, A3: 2.659, B3: 0,     B4: 3.267, D3: 0,     D4: 3.267, d2: 1.128, c4: 0.7979 },
    3: { A2: 1.023, A3: 1.954, B3: 0,     B4: 2.568, D3: 0,     D4: 2.574, d2: 1.693, c4: 0.8862 },
    4: { A2: 0.729, A3: 1.628, B3: 0,     B4: 2.266, D3: 0,     D4: 2.282, d2: 2.059, c4: 0.9213 },
    5: { A2: 0.577, A3: 1.427, B3: 0,     B4: 2.089, D3: 0,     D4: 2.114, d2: 2.326, c4: 0.9400 },
    6: { A2: 0.483, A3: 1.287, B3: 0.030, B4: 1.970, D3: 0,     D4: 2.004, d2: 2.534, c4: 0.9515 },
    7: { A2: 0.419, A3: 1.182, B3: 0.118, B4: 1.882, D3: 0.076, D4: 1.924, d2: 2.704, c4: 0.9594 },
    8: { A2: 0.373, A3: 1.099, B3: 0.185, B4: 1.815, D3: 0.136, D4: 1.864, d2: 2.847, c4: 0.9650 },
    9: { A2: 0.337, A3: 1.032, B3: 0.239, B4: 1.761, D3: 0.184, D4: 1.816, d2: 2.970, c4: 0.9693 },
   10: { A2: 0.308, A3: 0.975, B3: 0.284, B4: 1.716, D3: 0.223, D4: 1.777, d2: 3.078, c4: 0.9727 },
   11: { A2: 0.285, A3: 0.927, B3: 0.321, B4: 1.679, d2: 3.173, c4: 0.9754 }, // 补充 n=11 到 15
   12: { A2: 0.266, A3: 0.886, B3: 0.354, B4: 1.646, d2: 3.258, c4: 0.9776 },
   13: { A2: 0.249, A3: 0.850, B3: 0.382, B4: 1.618, d2: 3.336, c4: 0.9794 },
   14: { A2: 0.235, A3: 0.817, B3: 0.406, B4: 1.594, d2: 3.407, c4: 0.9810 },
   15: { A2: 0.223, A3: 0.789, B3: 0.428, B4: 1.572, d2: 3.472, c4: 0.9823 }
   // 可根据需要继续添加更大 n 的常数
};

/**
* I-MR 控制图常数 (基于 n=2 的移动极差)
*/
const IMR_CONSTANTS = {
   d2: 1.128, // 用于估计 sigma (MR_bar / d2)
   D3: 0,     // MR 图 LCL 因子
   D4: 3.267, // MR 图 UCL 因子
   E2: 2.660  // I 图控制限因子 (3 / d2)
};

// --- 基础统计函数 ---

/**
* 计算数组中有效数值的总和
* @param {number[]} arr - 输入数组
* @returns {number} 总和
*/
const sum = (arr) => arr.filter(n => typeof n === 'number' && isFinite(n)).reduce((a, b) => a + b, 0);

/**
* 计算数组中有效数值的平均值
* @param {number[]} arr - 输入数组
* @returns {number} 平均值 (如果数组无效或为空则返回 NaN)
*/
const mean = (arr) => {
   const validArr = arr.filter(n => typeof n === 'number' && isFinite(n));
   return validArr.length === 0 ? NaN : sum(validArr) / validArr.length;
};

/**
* 计算数组中有效数值的极差 (最大值 - 最小值)
* @param {number[]} arr - 输入数组
* @returns {number} 极差 (如果数组无效或少于一个有效值则返回 NaN)
*/
const range = (arr) => {
   const valid = arr.filter(n => typeof n === 'number' && isFinite(n));
   return valid.length > 0 ? Math.max(...valid) - Math.min(...valid) : NaN;
};

/**
* 计算数组的标准差
* @param {number[]} arr - 输入数组
* @param {boolean} [isSample=true] - true 计算样本标准差 (n-1)，false 计算总体标准差 (n)
* @returns {number} 标准差 (如果无法计算则返回 NaN)
*/
const stdDev = (arr, isSample = true) => {
   const validArr = arr.filter(n => typeof n === 'number' && isFinite(n));
   const n = validArr.length;
   if (n === 0 || (isSample && n === 1)) return NaN;
   const m = mean(validArr);
   if (isNaN(m)) return NaN;
   const variance = sum(validArr.map(x => Math.pow(x - m, 2))) / (isSample ? n - 1 : n);
   return Math.sqrt(variance);
};

/**
* 计算数组的中位数
* @param {number[]} arr - 输入数组
* @returns {number|NaN} 中位数 (如果数组无效或为空则返回 NaN)
*/
const median = (arr) => {
   const validArr = arr.filter(n => typeof n === 'number' && isFinite(n)).sort((a, b) => a - b);
   const len = validArr.length;
   if (len === 0) return NaN;
   const mid = Math.floor(len / 2);
   return len % 2 !== 0 ? validArr[mid] : (validArr[mid - 1] + validArr[mid]) / 2;
};
// spc-utils.js
// ... (其他函数和常量定义) ...

// --- 基础统计函数 ---
// ... (sum, mean, range, stdDev, median) ...

/**
 * 计算移动极差 (Moving Range)
 * @param {number[]} arr - 输入的个体值数组
 * @returns {number[]} 移动极差数组 (长度比原数组少1)
 */
const movingRanges = (arr) => {
    const mrs = [];
    // 先过滤掉非数值，确保只对有效数据计算MR
    const validData = arr.filter(n => typeof n === 'number' && isFinite(n));
    if (validData.length < 2) {
        return mrs; // 有效数据不足2个，无法计算MR
    }
    for (let i = 1; i < validData.length; i++) {
        // 此处 validData[i] 和 validData[i-1] 必然是有效数值
        mrs.push(Math.abs(validData[i] - validData[i - 1]));
    }
    return mrs;
};


// --- 正态性相关函数 ---

/**
* 使用 Sturges' Rule 计算直方图的最佳分箱数
* @param {number[]} data - 数据数组
* @returns {number} 建议的分箱数
*/
const sturgesRuleBins = (data) => {
   const validData = data.filter(n => typeof n === 'number' && isFinite(n));
   const n = validData.length;
   // 至少需要1个箱子，即使数据很少
   return n > 1 ? Math.ceil(1 + 3.322 * Math.log10(n)) : 1;
};

/**
* 生成直方图数据 (用于 ECharts bar series)
* @param {number[]} data - 原始数据数组
* @param {number} numBins - 分箱数量
* @returns {Array<Array<number>>} 格式为 [[binStart, binEnd, count], ...] 的数组
*/
const histogramData = (data, numBins) => {
   const validData = data.filter(n => typeof n === 'number' && isFinite(n)).sort((a, b) => a - b);
   const n = validData.length;
   if (n === 0) return [];

   const minVal = validData[0];
   const maxVal = validData[n - 1];

   // 处理只有一个唯一值的情况
   if (minVal === maxVal) {
       // 创建一个包含该值的单个箱子
       const buffer = Math.max(Math.abs(minVal * 0.01), 0.001); // 添加一点宽度
       return [[minVal - buffer, minVal + buffer, n]];
   }
   // 处理分箱数为1的情况
    if (numBins <= 0) numBins = 1;
   if (numBins === 1) {
       return [[minVal, maxVal, n]];
   }

   const binWidth = (maxVal - minVal) / numBins;
   const bins = [];
   const counts = [];

   // 创建箱子边界
   for (let i = 0; i < numBins; i++) {
       const binStart = minVal + i * binWidth;
       // 确保最后一个箱子的右边界是最大值
       const binEnd = (i === numBins - 1) ? maxVal : minVal + (i + 1) * binWidth;
       bins.push([binStart, binEnd]);
       counts.push(0);
   }

   // 分配数据到箱子
   validData.forEach(val => {
       for (let i = 0; i < numBins; i++) {
           const [binStart, binEnd] = bins[i];
           // 值在 [binStart, binEnd) 区间内，或者等于最后一个箱子的 binEnd
           if ((val >= binStart && val < binEnd) || (i === numBins - 1 && val === binEnd)) {
               counts[i]++;
               break; // 值只属于一个箱子
           }
       }
   });

   // 格式化为 ECharts 需要的格式
   return bins.map((bin, i) => [bin[0], bin[1], counts[i]]);
};


/**
* 正态分布概率密度函数 (PDF)
* @param {number} x - 需要计算密度的点
* @param {number} mu - 均值
* @param {number} sigma - 标准差
* @returns {number} 在 x 点的概率密度
*/
const normalPdf = (x, mu, sigma) => {
   if (sigma <= 0 || !isFinite(sigma) || !isFinite(mu) || !isFinite(x)) return 0;
   const sigmaSqrt2Pi = sigma * Math.sqrt(2 * Math.PI);
   if (sigmaSqrt2Pi === 0) return 0; // Avoid division by zero
   const exponent = -Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2));
   return (1 / sigmaSqrt2Pi) * Math.exp(exponent);
};

/**
* 生成用于绘制正态曲线的点集
* @param {number[]} data - 原始数据（用于确定范围）
* @param {number} mu - 均值
* @param {number} sigma - 标准差
* @param {number} [numPoints=100] - 生成点的数量
* @returns {Array<Array<number>>} 格式为 [[x, density], ...] 的数组
*/
const generateNormalCurveData = (data, mu, sigma, numPoints = 100) => {
   const validData = data.filter(n => typeof n === 'number' && isFinite(n)).sort((a, b) => a - b);
   if (validData.length < 2 || sigma <= 0 || !isFinite(sigma) || !isFinite(mu)) return [];

   // 确定绘图范围，通常取均值加减几个标准差，或者基于数据的 min/max
   const dataMin = validData[0];
   const dataMax = validData[validData.length - 1];
   const range = dataMax - dataMin;

   // 如果数据范围太小，用均值加减标准差确定范围
   const plotMin = range < 1e-6 ? mu - 3.5 * sigma : dataMin - range * 0.1;
   const plotMax = range < 1e-6 ? mu + 3.5 * sigma : dataMax + range * 0.1;

   // 确保 plotMin 和 plotMax 是有效的数字
   if (!isFinite(plotMin) || !isFinite(plotMax) || plotMin >= plotMax) {
       console.warn("无法确定正态曲线的有效绘图范围。");
       return [];
   }

   const step = (plotMax - plotMin) / (numPoints - 1);
   const curveData = [];
   for (let i = 0; i < numPoints; i++) {
       const x = plotMin + i * step;
       const density = normalPdf(x, mu, sigma);
       curveData.push([x, density]);
   }
   return curveData;
};


/**
* 计算偏度 (使用调整后的样本偏度估计 G1)
* @param {number[]} data - 数据数组
* @returns {number|NaN} 偏度值
*/
const skewness = (data) => {
   const validData = data.filter(n => typeof n === 'number' && isFinite(n));
   const n = validData.length;
   if (n < 3) return NaN;
   const m = mean(validData);
   const s = stdDev(validData, true); // Sample standard deviation
   if (s === 0 || !isFinite(s)) return 0; // Skewness is 0 or undefined if variance is 0

   const m3 = sum(validData.map(x => Math.pow(x - m, 3))) / n; // 3rd central moment (population version)
   const g1 = m3 / Math.pow(s, 3); // Population skewness estimate

   // Apply sample correction (G1)
   const G1 = (Math.sqrt(n * (n - 1)) / (n - 2)) * g1;
   return G1;
};

/**
* 计算超额峰度 (使用调整后的样本峰度估计 G2)
* @param {number[]} data - 数据数组
* @returns {number|NaN} 超额峰度值 (Kurtosis - 3)
*/
const kurtosis = (data) => {
   const validData = data.filter(n => typeof n === 'number' && isFinite(n));
   const n = validData.length;
   if (n < 4) return NaN; // Kurtosis requires at least 4 data points for sample correction

   const m = mean(validData);
   const m2 = sum(validData.map(x => Math.pow(x - m, 2))) / n; // 2nd central moment (population version)
   const m4 = sum(validData.map(x => Math.pow(x - m, 4))) / n; // 4th central moment (population version)

   if (m2 === 0 || !isFinite(m2)) return NaN; // Undefined if variance is 0

   // Population Excess Kurtosis (g2)
   const g2 = (m4 / Math.pow(m2, 2)) - 3;

   // Apply sample correction (G2)
   const G2 = ((n - 1) / ((n - 2) * (n - 3))) * ((n + 1) * g2 + 6);
   return G2;
};


// --- 格式化函数 ---
const formatNum = (num, digits = 6) => (typeof num === 'number' && isFinite(num)) ? num.toFixed(digits) : 'N/A';
const formatIndex = (num, digits = 3) => (typeof num === 'number' && isFinite(num)) ? num.toFixed(digits) : 'N/A';

// --- 获取评价 ---
function getEvaluation(value) {
   if (typeof value !== 'number' || !isFinite(value)) return 'N/A';
   if (value >= 1.33) return '优秀 (≥1.33)';
   if (value >= 1.0) return '合格 (1.0-1.33)';
   return '不合格 (<1.0)';
}

// --- 西格玛规则检查 ---
/**
* 检查控制图数据是否违反常见的西格玛判异规则 (基于 I 图或 Xbar 图)
* @param {number[]} data - 数据点数组 (个体值或子组均值)
* @param {number} centerLine - 中心线值
* @param {number} sigma - 过程标准差估计值
* @returns {{violations: object, descriptions: object}} 包含违规点索引和规则描述的对象
*/
function checkControlChartRules(data, centerLine, sigma) {
   const violations = {};
   const n = data.length;
   const sigma1 = sigma;
   const sigma2 = 2 * sigma;
   const sigma3 = 3 * sigma;
   // 基于 Western Electric Rules (WECO) 或 Nelson Rules 的常见规则
   const ruleDescriptions = {
       1: "1点超出±3σ控制限 (A区外)",
       2: "连续9点落在中心线同一侧",
       3: "连续6点递增或递减",
       4: "连续14点交互上下波动",
       5: "连续3点中有2点落在±2σ之外 (A区) 同一侧", // 修正：通常要求同一侧
       6: "连续5点中有4点落在±1σ之外 (B区) 同一侧", // 修正：通常要求同一侧
       7: "连续15点落在±1σ之内 (C区)",
       8: "连续8点落在中心线两侧，但没有点在±1σ内 (C区)" // 这条规则较少用，且较难精确定义，此处为简化版
   };

   if (n === 0 || !isFinite(centerLine) || !isFinite(sigma) || sigma <= 0) {
        return { violations: {}, descriptions: ruleDescriptions };
   }

    const ucl3Sigma = centerLine + sigma3;
    const lcl3Sigma = centerLine - sigma3;
    const ucl2Sigma = centerLine + sigma2;
    const lcl2Sigma = centerLine - sigma2;
    const ucl1Sigma = centerLine + sigma1;
    const lcl1Sigma = centerLine - sigma1;

   // Rule 1: 1 point beyond Zone A
   const rule1_indices = data.reduce((acc, val, idx) => { if (val > ucl3Sigma || val < lcl3Sigma) acc.push(idx); return acc; }, []);
   if (rule1_indices.length) violations[1] = rule1_indices;

   // Rule 2: 9 points in a row on same side of CL
   if (n >= 9) { const rule2_indices = new Set(); for (let i = 0; i <= n - 9; i++) { const subset = data.slice(i, i + 9); const above = subset.every(val => val > centerLine); const below = subset.every(val => val < centerLine); if (above || below) { for (let j = 0; j < 9; j++) rule2_indices.add(i + j); } } if (rule2_indices.size) violations[2] = Array.from(rule2_indices).sort((a, b) => a - b); }

   // Rule 3: 6 points in a row, all increasing or all decreasing
   if (n >= 6) { const rule3_indices = new Set(); for (let i = 0; i <= n - 6; i++) { const subset = data.slice(i, i + 6); let increasing = true; let decreasing = true; for (let j = 0; j < 5; j++) { if (subset[j+1] <= subset[j]) increasing = false; if (subset[j+1] >= subset[j]) decreasing = false; if (!increasing && !decreasing) break;} if (increasing || decreasing) { for (let j = 0; j < 6; j++) rule3_indices.add(i + j); } } if (rule3_indices.size) violations[3] = Array.from(rule3_indices).sort((a, b) => a - b); }

   // Rule 4: 14 points in a row, alternating up and down
   if (n >= 14) { const rule4_indices = new Set(); for (let i = 0; i <= n - 14; i++) { const subset = data.slice(i, i + 14); let alternating = true; let lastDiffSign = 0; for (let j = 0; j < 13; j++) { const diff = subset[j+1] - subset[j]; const currentSign = Math.sign(diff); if (currentSign === 0 || (lastDiffSign !== 0 && currentSign === lastDiffSign)) { alternating = false; break; } if (currentSign !== 0) lastDiffSign = currentSign; } if (alternating) { for (let j = 0; j < 14; j++) rule4_indices.add(i + j); } } if (rule4_indices.size) violations[4] = Array.from(rule4_indices).sort((a, b) => a - b); }

   // Rule 5: 2 out of 3 points in Zone A or beyond (on same side)
   if (n >= 3) { const rule5_indices = new Set(); for (let i = 0; i <= n - 3; i++) { const subset = data.slice(i, i + 3); const aboveCount = subset.filter(val => val > ucl2Sigma).length; const belowCount = subset.filter(val => val < lcl2Sigma).length; if (aboveCount >= 2 || belowCount >= 2) { for (let j = 0; j < 3; j++) rule5_indices.add(i + j); } } if (rule5_indices.size) violations[5] = Array.from(rule5_indices).sort((a, b) => a - b); }

   // Rule 6: 4 out of 5 points in Zone B or beyond (on same side)
   if (n >= 5) { const rule6_indices = new Set(); for (let i = 0; i <= n - 5; i++) { const subset = data.slice(i, i + 5); const aboveCount = subset.filter(val => val > ucl1Sigma).length; const belowCount = subset.filter(val => val < lcl1Sigma).length; if (aboveCount >= 4 || belowCount >= 4) { for (let j = 0; j < 5; j++) rule6_indices.add(i + j); } } if (rule6_indices.size) violations[6] = Array.from(rule6_indices).sort((a, b) => a - b); }

   // Rule 7: 15 points in a row in Zone C
   if (n >= 15) { const rule7_indices = new Set(); for (let i = 0; i <= n - 15; i++) { if (data.slice(i, i + 15).every(val => val < ucl1Sigma && val > lcl1Sigma)) { for (let j = 0; j < 15; j++) rule7_indices.add(i + j); } } if (rule7_indices.size) violations[7] = Array.from(rule7_indices).sort((a, b) => a - b); }

   // Rule 8: 8 points in a row beyond Zone C (no points within +/- 1 sigma)
   if (n >= 8) { const rule8_indices = new Set(); for (let i = 0; i <= n - 8; i++) { if (data.slice(i, i + 8).every(val => val > ucl1Sigma || val < lcl1Sigma)) { for (let j = 0; j < 8; j++) rule8_indices.add(i + j); } } if (rule8_indices.size) violations[8] = Array.from(rule8_indices).sort((a, b) => a - b); }

   return { violations: violations, descriptions: ruleDescriptions };
}

// --- 错误显示 ---
function displayError(message, containerId = 'error-container') {
   const errorContainer = document.getElementById(containerId);
   if (errorContainer) {
       errorContainer.textContent = message;
       errorContainer.classList.remove('hidden');
       // Hide content sections on error
       document.querySelectorAll('.container-section').forEach(el => el.style.display = 'none');
   } else {
       alert("发生错误: " + message); // Fallback
   }
}
// spc-utils.js
// ... (已有代码) ...

// --- 日期时间格式化 ---
const getCurrentTimestamp = () => {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`;
};

// ... (其余 spc-utils.js 内容) ...

// 如果使用模块化系统，可以在这里导出:
// export { CONTROL_CHART_CONSTANTS, IMR_CONSTANTS, mean, stdDev, ... };
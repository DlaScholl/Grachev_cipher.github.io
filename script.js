document.addEventListener("DOMContentLoaded", function() {
    // Подсветка меню
    const currentPath = window.location.pathname.split("/").pop();
    document.querySelectorAll("nav ul li a").forEach(link => {
        if (link.getAttribute("href") === currentPath) {
            link.classList.add("active");
        }
    });

    const abc = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
    const abcU = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

    // --- УМНАЯ БЛОКИРОВКА КАЛЬКУЛЯТОРА ВО ВРЕМЯ ТЕСТА ---
    document.querySelectorAll(".calc-link, a[href='crypt-calc.html']").forEach(link => {
        link.addEventListener("click", function(e) {
            const currentStatus = sessionStorage.getItem("crypto_quiz_state");
            if (currentStatus === "IN_PROGRESS") {
                e.preventDefault(); 
                if (window.location.pathname.includes("training.html")) {
                    const notice = document.getElementById("lock-notice");
                    if (notice) {
                        notice.style.display = "block";
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                } else {
                    window.location.href = "training.html?status=locked";
                }
            }
        });
    });

    if (window.location.search.includes("status=locked")) {
        const notice = document.getElementById("lock-notice");
        if (notice) notice.style.display = "block";
    }

    const statusText = document.getElementById("quiz-status");
    const savedState = sessionStorage.getItem("crypto_quiz_state");
    if (statusText) {
        if (savedState === "IN_PROGRESS") {
            statusText.innerText = "Статус: Тест выполняется... [Калькулятор заблокирован]";
            statusText.style.color = "#ff7b72";
        } else if (savedState === "FINISHED") {
            statusText.innerText = "Статус: Тест завершен! Калькулятор разблокирован.";
            statusText.style.color = "#56d364";
        }
    }

    // --- ЛОГИКА ТЕСТА (ОБНОВЛЕНО ПОД 10 ВОПРОСОВ) ---
    let correctCount = 0;
    const totalQuestions = 10; // Поменяли на 10

    window.checkAnswer = function(element, isCorrect) {
        if (!sessionStorage.getItem("crypto_quiz_state") || sessionStorage.getItem("crypto_quiz_state") === "NOT_STARTED") {
            sessionStorage.setItem("crypto_quiz_state", "IN_PROGRESS");
            if (statusText) {
                statusText.innerText = "Статус: Тест выполняется... [Калькулятор заблокирован]";
                statusText.style.color = "#ff7b72";
            }
        }

        const parent = element.parentElement;
        const options = parent.querySelectorAll(".quiz-option");
        options.forEach(opt => opt.style.pointerEvents = "none");

        if (isCorrect) {
            element.classList.add("correct");
            correctCount++;
        } else {
            element.classList.add("wrong");
            options.forEach(opt => {
                if (opt.getAttribute("onclick").includes("true")) {
                    opt.classList.add("correct");
                }
            });
        }

        let answeredBoxes = 0;
        document.querySelectorAll(".quiz-question").forEach(q => {
            if (q.querySelectorAll(".correct, .wrong").length > 0) answeredBoxes++;
        });

        if (answeredBoxes === totalQuestions) {
            sessionStorage.setItem("crypto_quiz_state", "FINISHED"); 
            const notice = document.getElementById("lock-notice");
            if (notice) notice.style.display = "none";

            if (statusText) {
                statusText.innerHTML = `Тест окончен! Результат: ${correctCount}/${totalQuestions}. Калькулятор снова доступен. <button class="btn" style="padding:4px 10px; margin-left:10px; font-size:13px;" onclick="sessionStorage.setItem('crypto_quiz_state','NOT_STARTED'); location.reload();">Пройти заново</button>`;
                statusText.style.color = "#56d364";
            }
        }
    };

    // --- 1. ШИФР ЦЕЗАРЯ ---
    const caesarBtn = document.getElementById("caesar-btn");
    if (caesarBtn) {
        caesarBtn.addEventListener("click", () => {
            const text = document.getElementById("caesar-text").value;
            let shift = parseInt(document.getElementById("caesar-shift").value) || 3;
            const mode = document.getElementById("caesar-mode").value;
            
            if (shift < 1) shift = 1;
            if (shift > 20) shift = 20;
            document.getElementById("caesar-shift").value = shift;
            
            const actualShift = mode === "crypt" ? shift : -shift;
            document.getElementById("caesar-result").innerText = runCaesar(text, actualShift);
        });
    }

    function runCaesar(text, shift) {
        let res = "";
        for (let char of text) {
            if (abc.includes(char)) {
                let idx = (abc.indexOf(char) + shift) % 33;
                if (idx < 0) idx += 33;
                res += abc[idx];
            } else if (abcU.includes(char)) {
                let idx = (abcU.indexOf(char) + shift) % 33;
                if (idx < 0) idx += 33;
                res += abcU[idx];
            } else {
                res += char;
            }
        }
        return res;
    }

    // --- 2. ШИФР ВИЖЕНЕРА ---
    const vigenereBtn = document.getElementById("vigenere-btn");
    if (vigenereBtn) {
        vigenereBtn.addEventListener("click", () => {
            const text = document.getElementById("vigenere-text").value;
            const key = document.getElementById("vigenere-key").value.toLowerCase();
            const mode = document.getElementById("vigenere-mode").value;

            if (!key) {
                document.getElementById("vigenere-result").innerText = "Ошибка: Введите ключевое слово!";
                return;
            }
            document.getElementById("vigenere-result").innerText = runVigenere(text, key, mode);
        });
    }

    function runVigenere(text, key, mode) {
        let res = "";
        let keyIdx = 0;

        for (let char of text) {
            const isLower = abc.includes(char);
            const isUpper = abcU.includes(char);

            if (isLower || isUpper) {
                const keyChar = key[keyIdx % key.length];
                let shift = abc.includes(keyChar) ? abc.indexOf(keyChar) : 0;
                
                if (mode === "decrypt") {
                    shift = -shift;
                }

                if (isLower) {
                    let idx = (abc.indexOf(char) + shift) % 33;
                    if (idx < 0) idx += 33;
                    res += abc[idx];
                } else {
                    let idx = (abcU.indexOf(char) + shift) % 33;
                    if (idx < 0) idx += 33;
                    res += abcU[idx];
                }
                keyIdx++;
            } else {
                res += char;
            }
        }
        return res;
    }

    // --- 3. СИМУЛЯТОР ЭНИГМЫ ---
    const enigmaBtn = document.getElementById("enigma-btn");
    if (enigmaBtn) {
        enigmaBtn.addEventListener("click", () => {
            const text = document.getElementById("enigma-text").value.toUpperCase();
            const r1 = parseInt(document.getElementById("rot1").value);
            const r2 = parseInt(document.getElementById("rot2").value);
            const r3 = parseInt(document.getElementById("rot3").value);
            
            document.getElementById("enigma-result").innerText = runEnigma(text, r1, r2, r3);
        });
    }

    function runEnigma(text, pos1, pos2, pos3) {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const rotor1 = "EKMFLGDQVZNTOWYHXUSPAIBRCJ";
        const rotor2 = "AJDKSIRUXBLHWTMCQGZNPYFVOE";
        const rotor3 = "BDFHJLCPRTXVZNYEIWGAKMUSQO";
        const reflector = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

        let res = "";

        for (let char of text) {
            if (!alphabet.includes(char)) {
                res += char;
                continue;
            }

            pos1 = (pos1 + 1) % 26;
            if (pos1 === 0) {
                pos2 = (pos2 + 1) % 26;
                if (pos2 === 0) {
                    pos3 = (pos3 + 1) % 26;
                }
            }

            let idx = alphabet.indexOf(char);

            idx = (rotor1.indexOf(alphabet[(idx + pos1) % 26]) - pos1 + 26) % 26;
            idx = (rotor2.indexOf(alphabet[(idx + pos2) % 26]) - pos2 + 26) % 26;
            idx = (rotor3.indexOf(alphabet[(idx + pos3) % 26]) - pos3 + 26) % 26;

            idx = alphabet.indexOf(reflector[idx]);

            idx = (alphabet.indexOf(rotor3[(idx + pos3) % 26]) - pos3 + 26) % 26;
            idx = (alphabet.indexOf(rotor2[(idx + pos2) % 26]) - pos2 + 26) % 26;
            idx = (alphabet.indexOf(rotor1[(idx + pos1) % 26]) - pos1 + 26) % 26;

            res += alphabet[idx];
        }
        return res;
    }
});

# Acid-Base Titration Simulation

An interactive web-based tool to visualize and analyze acid-base titration curves. Designed for educational and research use by students, instructors, and chemistry enthusiasts.

---

## 📌 Features

- Simulate titration curves for:
  - Strong acids (e.g., HCl)
  - Strong bases (e.g., NaOH)
  - Weak acids (e.g., CH₃COOH)
- Adjustable acid/base concentrations and volumes
- Real-time pH display
- Live titration animation (1 mL steps)
- Responsive design and charting via Chart.js

---

## 💻 How to Use

1. Open `index.html` in your browser (Chrome, Firefox recommended).
2. Choose a substance from the dropdown.
3. Adjust the acid concentration using the slider.
4. Enter the volume of acid and the concentration of base.
5. Click:
   - **Simulate Full Curve** to generate the entire titration graph instantly.
   - **Start Live Titration** to watch the curve build step-by-step.

---

## 🔬 Scientific Background

- **Strong Acids/Bases**: Use direct [H⁺] or [OH⁻] concentration to calculate pH/pOH.
- **Weak Acids**: Use the Henderson-Hasselbalch equation to calculate buffer pH.
- pH is capped between 0 and 14.
- Graph displays volume of base added (mL) vs. resulting pH.

---

## 📂 Project Structure

acid-base-simulation/
│
├── index.html # Main UI
├── styles.css # Styling
├── script.js # pH logic + chart rendering
└── README.md # You're here!

yaml
Copy

---

## 🚀 Deployment

To deploy the simulation online via GitHub Pages:

1. Push the project to a GitHub repository.
2. Go to the repository’s **Settings** > **Pages**.
3. Choose `main` branch and `/root` as the source.
4. Access your site via `https://your-username.github.io/your-repo-name/`.

---

## ✅ To-Do / Future Features

- Add base volume sliders
- Export chart as image or PDF
- Add support for polyprotic acids
- Include error handling for invalid inputs

---

## 🧑‍💻 Author

**Your Name**  
Built as part of a project for educational purposes.  
[LinkedIn or GitHub profile link (optional)]

---

## 📘 License

This project is licensed under the MIT License.
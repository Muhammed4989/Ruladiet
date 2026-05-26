document.addEventListener('DOMContentLoaded', function() {
    var weightInput = document.getElementById('weight');
    var heightInput = document.getElementById('height');
    var calculateBtn = document.getElementById('bmiCalculate');
    var resetBtn = document.getElementById('bmiReset');
    var bmiValue = document.getElementById('bmiValue');
    var bmiCategory = document.getElementById('bmiCategory');

    calculateBtn.addEventListener('click', calculateBMI);
    resetBtn.addEventListener('click', resetBMI);

    weightInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateBMI();
    });

    heightInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateBMI();
    });

    function calculateBMI() {
        var weight = parseFloat(weightInput.value);
        var height = parseFloat(heightInput.value);

        if (!weight || !height || weight <= 0 || height <= 0) {
            alert('يرجى إدخال قيم صحيحة أكبر من صفر لكل من الوزن والطول.');
            return;
        }

        var heightM = height / 100;
        var bmi = weight / (heightM * heightM);
        bmi = Math.round(bmi * 100) / 100;

        bmiValue.textContent = bmi;

        var category = '';
        var className = '';

        if (bmi < 18.5) {
            category = 'نقص في الوزن';
            className = 'underweight';
        } else if (bmi < 25) {
            category = 'وزن طبيعي';
            className = 'normal';
        } else if (bmi < 30) {
            category = 'زيادة في الوزن';
            className = 'overweight';
        } else {
            category = 'سمنة : 30<';
            className = 'obese';
        }

        bmiCategory.textContent = category;
        bmiCategory.className = 'result-badge ' + className;
    }

    function resetBMI() {
        weightInput.value = '';
        heightInput.value = '';
        bmiValue.textContent = '--';
        bmiCategory.textContent = '—';
        bmiCategory.className = 'result-badge';
    }
});

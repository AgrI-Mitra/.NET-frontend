(function () {
	for (const dropdown of document.querySelectorAll(".custom-select-wrapper")) {
		dropdown.addEventListener('click', function () {
			this.querySelector('.custom-select').classList.toggle('open');
		})
	}
	for (const option of document.querySelectorAll(".custom-option")) {
		option.addEventListener('click', function () {
			if (!this.classList.contains('selected')) {
				this.parentNode.querySelector('.custom-option.selected').classList.remove('selected');
				this.classList.add('selected');
				this.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = this.textContent;
				this.closest('.custom-select-wrapper').querySelector('.choose__select span').textContent = this.textContent;
			}
		})
	}
	window.addEventListener('click', function (e) {
		for (const select of document.querySelectorAll('.custom-select')) {
			if (!select.contains(e.target)) {
				select.classList.remove('open');
			}
		}
	});
	function selectOption(index) {
		var optionOnIdx = document.querySelector('.custom-option:nth-child(' + index + ')');
		var optionSelected = document.querySelector('.custom-option.selected');
		if (optionOnIdx !== optionSelected) {
			optionSelected.parentNode.querySelector('.custom-option.selected').classList.remove('selected');
			optionOnIdx.classList.add('selected');
			optionOnIdx.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = optionOnIdx.textContent;
			optionOnIdx.closest('.custom-select-wrapper').querySelector('.choose__select span').textContent = optionOnIdx.textContent;
		}
	}
})();
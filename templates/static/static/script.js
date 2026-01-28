document.getElementById('start-test').addEventListener('click', startSpeedTest);

function startSpeedTest() {
    const startBtn = document.getElementById('start-test');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const status = document.getElementById('status');
    const results = document.getElementById('results');
    const speedValue = document.getElementById('speed-value');
    const details = document.getElementById('details');
    const needle = document.getElementById('needle');

    startBtn.classList.add('hidden');
    progressContainer.classList.remove('hidden');
    results.classList.add('hidden');

    status.textContent = 'Starting download...';
    progressFill.style.width = '0%';

    const startTime = Date.now();
    const fileUrl = '/static/testfile.bin'; // 10MB file

    fetch(fileUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            const contentLength = response.headers.get('content-length');
            let loaded = 0;

            return new Response(
                new ReadableStream({
                    start(controller) {
                        const reader = response.body.getReader();
                        function pump() {
                            reader.read().then(({ done, value }) => {
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                loaded += value.byteLength;
                                const percent = (loaded / contentLength) * 100;
                                progressFill.style.width = percent + '%';
                                status.textContent = `Downloading... ${Math.round(percent)}%`;
                                controller.enqueue(value);
                                pump();
                            });
                        }
                        pump();
                    }
                })
            );
        })
        .then(() => {
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000; // seconds
            const fileSizeMB = 10; // 10MB file
            const speedMbps = (fileSizeMB / duration).toFixed(2); // MB/s

            progressContainer.classList.add('hidden');
            results.classList.remove('hidden');
            speedValue.textContent = speedMbps;
            details.textContent = `Downloaded 10MB in ${duration.toFixed(2)}s.`;

            // Animate gauge needle (0-100 scale, cap at 100)
            const angle = Math.min((speedMbps / 100) * 180 - 90, 90); // -90 to 90 deg
            needle.style.transform = `translateX(-50%) rotate(${angle}deg)`;

            // Log to backend
            fetch('/api/log_speed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ speed: speedMbps })
            });
        })
        .catch(error => {
            status.textContent = 'Error: ' + error.message;
            progressFill.style.width = '0%';
            setTimeout(() => {
                startBtn.classList.remove('hidden');
                progressContainer.classList.add('hidden');
            }, 2000);
        });
}
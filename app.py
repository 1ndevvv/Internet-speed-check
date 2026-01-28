from flask import Flask, render_template, send_from_directory, request, jsonify
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

@app.route('/api/log_speed', methods=['POST'])
def log_speed():
    data = request.get_json()
    speed = data.get('speed', 0)
    # Simple logging (in production, use a database)
    with open('logs/speed_logs.txt', 'a') as f:
        f.write(f"Speed: {speed} MB/s\n")
    return jsonify({"status": "logged"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
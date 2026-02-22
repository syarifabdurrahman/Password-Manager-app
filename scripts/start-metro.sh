#!/bin/bash
# Start Metro bundler in a new Konsole window

cd "$(dirname "$0")/.."

# Check if Metro is already running
if curl -s http://localhost:8081/status > /dev/null 2>&1; then
    echo "✓ Metro is already running"
else
    # Create a wrapper that keeps Metro running
    cat > /tmp/metro-launcher.sh << 'EOF'
#!/bin/bash
cd "/home/syarif/Projects/P-React Native/Hello World/Password-Manager-app"
npm start
echo ""
echo "Metro stopped. Press Enter to close this window..."
read
EOF
    chmod +x /tmp/metro-launcher.sh
    konsole -e /tmp/metro-launcher.sh > /dev/null 2>&1 &

    # Wait for Metro to start
    echo "Starting Metro bundler..."
    for i in {1..30}; do
        if curl -s http://localhost:8081/status > /dev/null 2>&1; then
            echo "✓ Metro started successfully"
            break
        fi
        sleep 1
    done
fi

# Run Android build
echo ""
echo "Starting Android build..."
react-native run-android --no-packager

# Keep terminal open after build (like Windows)
echo ""
echo "=========================================="
echo "Build complete! App is running on device."
echo "Press Ctrl+C to exit, or keep this terminal open for logs."
echo "=========================================="
echo ""

# Keep the script running - user can press Ctrl+C to exit
while true; do
    sleep 1
done
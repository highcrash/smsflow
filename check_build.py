import paramiko, re, sys, socket, time
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# First check TCP connectivity
try:
    s = socket.create_connection(('192.168.86.33', 22), timeout=3)
    s.close()
    print("TCP port 22: OPEN")
except Exception as e:
    print(f"TCP port 22: CLOSED/TIMEOUT ({e})")
    sys.exit(0)

# Try SSH with short timeout
try:
    t = paramiko.Transport(('192.168.86.33', 22))
    t.connect(timeout=8)
    t.auth_password('root', '62348787')

    c = t.open_session()
    c.exec_command('pgrep -fa docker | grep compose; echo "---"; tail -10 /tmp/docker-build.log 2>/dev/null | cat')
    out = c.makefile('rb', timeout=8).read()
    c.close()
    t.close()
    print("SSH: OK")
    print(re.sub(r'\x1b\[[0-9;]*m', '', out.decode('utf-8', errors='replace')))
except Exception as e:
    print(f"SSH error: {e}")

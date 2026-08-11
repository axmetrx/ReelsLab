$r = Invoke-WebRequest -Uri 'http://127.0.0.1:3001/api/courses/reelslab-course-01/tree' -Headers @{'x-user-id'='user-maria-001'} -TimeoutSec 5
$r.Content.Substring(0, [Math]::Min(800, $r.Content.Length))

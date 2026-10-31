using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

internal static class SourceLauncher
{
    [STAThread]
    private static void Main()
    {
        string root = AppDomain.CurrentDomain.BaseDirectory;
        try
        {
            string temp = Path.Combine(root, ".runtime", "temp");
            Directory.CreateDirectory(temp);
            ProcessStartInfo build = NewNodeProcess(root, "scripts/build.cjs", temp);
            build.RedirectStandardOutput = true;
            build.RedirectStandardError = true;
            using (Process process = Process.Start(build))
            {
                string stdout = process.StandardOutput.ReadToEnd();
                string stderr = process.StandardError.ReadToEnd();
                process.WaitForExit();
                if (process.ExitCode != 0)
                    throw new InvalidOperationException("源码编译失败：\n\n" + stdout + stderr);
            }
            ProcessStartInfo verify = NewNodeProcess(root, "scripts/start.cjs", temp);
            verify.Arguments += " --check";
            verify.RedirectStandardOutput = true;
            verify.RedirectStandardError = true;
            using (Process process = Process.Start(verify))
            {
                string stdout = process.StandardOutput.ReadToEnd();
                string stderr = process.StandardError.ReadToEnd();
                process.WaitForExit();
                if (process.ExitCode != 0)
                    throw new InvalidOperationException("Electron 检查失败：\n\n" + stdout + stderr);
            }
            Process.Start(NewNodeProcess(root, "scripts/start.cjs", temp));
        }
        catch (Exception error)
        {
            MessageBox.Show("无法启动 Yorushika 开发版。\n\n" + error.Message + "\n\n请检查 Node.js、项目依赖和 Electron 配置。", "Yorushika 开发启动器", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private static ProcessStartInfo NewNodeProcess(string root, string script, string temp)
    {
        ProcessStartInfo info = new ProcessStartInfo("node.exe", "\"" + Path.Combine(root, script) + "\"");
        info.WorkingDirectory = root;
        info.UseShellExecute = false;
        info.CreateNoWindow = true;
        info.EnvironmentVariables.Remove("ELECTRON_RUN_AS_NODE");
        info.EnvironmentVariables["TEMP"] = temp;
        info.EnvironmentVariables["TMP"] = temp;
        return info;
    }
}

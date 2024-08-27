using System;
using System.Diagnostics;
using System.IO;

public class TimestampedTextWriterTraceListener : TextWriterTraceListener
{
    public TimestampedTextWriterTraceListener(string fileName)
        : base(fileName) { }

    public override void WriteLine(string message)
    {
        base.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss} {message}");
    }

    public override void Write(string message)
    {
        base.Write($"{DateTime.Now:yyyy-MM-dd HH:mm:ss} {message}");
    }
}
"""Give a closed hero loop the reference's pacing: a sweep, then a rest.

The reference's hero changes 8–22 luma levels a second — calm for a couple of seconds, then a sweep — where
a generated take drifts at one speed. This re-times a loop with the speed curve v(t) = 1 − A·cos(2πt/T):
slowest (1 − A) at the loop point, fastest (1 + A) half-way round, averaging 1, so the loop keeps its length
and its first and last frames still meet. The curve is applied as a piecewise-linear time map (setpts), and
minterpolate fills the slow stretches.

    tools/.venv/bin/python tools/node/hero-pace.py <in.mp4> <out.mp4> [A=0.6] [segments=24]
"""
import math, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
FF = os.path.join(HERE, "node_modules/ffmpeg-static/ffmpeg")
D = os.path.join(HERE, "../../design/media/drafts")


def duration(path):
    out = subprocess.run([FF, "-hide_banner", "-i", path], capture_output=True, text=True).stderr
    h, m, s = out.split("Duration: ")[1].split(",")[0].split(":")
    return int(h) * 3600 + int(m) * 60 + float(s)


def main():
    src, dst = sys.argv[1], sys.argv[2]
    A = float(sys.argv[3]) if len(sys.argv) > 3 else 0.6
    N = int(sys.argv[4]) if len(sys.argv) > 4 else 24
    src_p, dst_p = os.path.join(D, src), os.path.join(D, dst)
    T = duration(src_p)
    # segment k covers output [k·T/N, (k+1)·T/N) at the curve's mean speed there; input consumed = T overall
    dt = T / N
    speeds = [1 - A * (math.sin(2 * math.pi * (k + 1) / N) - math.sin(2 * math.pi * k / N)) / (2 * math.pi / N) for k in range(N)]
    s_in, t_out = [0.0], [0.0]
    for v in speeds:
        s_in.append(s_in[-1] + v * dt); t_out.append(t_out[-1] + dt)
    # setpts maps input time S to output time: t_k + (S − s_k) / v_k on the k-th stretch, as nested ifs
    expr = f"{t_out[-2]:.5f}+(S-{s_in[-2]:.5f})/{speeds[-1]:.5f}"
    for k in range(N - 2, -1, -1):
        expr = f"if(lt(S,{s_in[k + 1]:.5f}),{t_out[k]:.5f}+(S-{s_in[k]:.5f})/{speeds[k]:.5f},{expr})"
    expr = expr.replace("S", "(PTS*TB)")
    vf = f"setpts='({expr})/TB',minterpolate=fps=24:mi_mode=blend"
    subprocess.run([FF, "-loglevel", "error", "-y", "-i", src_p, "-vf", vf, "-t", f"{T:.3f}", "-an",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
                    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "iec61966-2-1", "-color_range", "tv",
                    "-movflags", "+faststart", dst_p], check=True)
    print(f"paced {src} → {dst}: {T:.2f} s, speed {min(speeds):.2f}–{max(speeds):.2f}")


main()

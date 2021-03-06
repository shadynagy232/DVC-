---
title: DVC 2.0 Pre-Release
date: 2021-02-17
description: >
  Today, we're announcing DVC 2.0 pre-release. We'll share lessons from our
  journey and how these will be reflected in the coming release.
descriptionLong: >
  The new release is a result of our learning from our users. There are four
  major features coming:

  ๐ ML pipeline templating and iterative foreach stages

  ๐งช Lightweight ML experiments

  ๐ ML model checkpoints

  ๐ Dvc-live - new open-source library for metrics logging
picture: 2021-02-18/dvc-2-0-pre-release.png
pictureComment: DVC 2.0 Pre-Release
author: dmitry_petrov
commentsUrl: https://discuss.dvc.org/t/dvc-2-0-pre-release/681
tags:
  - Release
  - MLOps
  - DataOps
---

## Install

First things first. You can install the 2.0 pre-release from the master branch
in our repo (instruction [here](https://dvc.org/doc/install/pre-release)) or
through pip:

```dvc
$ pip install --upgrade --pre dvc
```

## ML pipelines parameterization and foreach stages

After introducing the multi-stage pipeline file `dvc.yaml`, it was quickly
adopted among our users. The DVC team got tons of positive feedback from them,
as well as feature requests.

### Pipeline parameters from `vars`

The most requested feature was the ability to use parameters in `dvc.yaml`. For
example. So, you can pass the same seed value or filename to multiple stages in
the pipeline.

```yaml
vars:
    train_matrix: train.pkl
    test_matrix: test.pkl
    seed: 20210215

...

stages:
    process:
        cmd: python process.py \
                --seed ${seed} \
                --train ${train_matrix} \
                --test ${test_matrix}
        outs:
        - ${test_matrix}
        - ${train_matrix}

        ...

    train:
        cmd: python train.py ${train_matrix} --seed ${seed}
        deps:
        - ${train_matrix}
```

Also, it gives an ability to localize all the important parameters in a single
`vars` block and play with them. This is a natural thing to do for scenarios
like NLP or when hyperparameter optimization is happening not only in the model
training code but in the data processing as well.

### Pipeline parameters from params files

It is quite common to define pipeline parameters in a config file or a
parameters file (like `params.yaml`) instead of in the pipeline file `dvc.yaml`
itself. These parameters defined in `params.yaml` can also be used in
`dvc.yaml`.

```yaml
# params.yaml
models:
  us:
    thresh: 10
    filename: 'model-us.hdf5'
```

```yaml
# dvc.yaml
stages:
  build-us:
    cmd: >-
      python script.py
        --out ${models.us.filename}
        --thresh ${models.us.thresh}
    outs:
      - ${models.us.filename}
```

DVC properly tracks params dependencies for each stage starting from the
previous DVC version 1.0. See the
[`--params` option](/doc/command-reference/run#for-displaying-and-comparing-data-science-experiments)
of `dvc run` for more details.

### Iterating over params with foreach stages

Iterating over params was a frequently requested feature. Now users can define
multiple similar stages with a templatized command.

```yaml
stages:
  build:
    foreach:
      gb:
        thresh: 15
        filename: 'model-gb.hdf5'
      us:
        thresh: 10
        filename: 'model-us.hdf5'
    do:
      cmd: >-
        python script.py --out ${item.filename} --thresh ${item.thresh}
      outs:
        - ${item.filename}
```

## Lightweight ML experiments

DVC uses Git versioning as the basis for ML experiments. This solid foundation
makes each experiment reproducible and accessible from the project's history.
This Git-based approach works very well for ML projects with mature models when
only a few new experiments per day are run.

However, in more active development, when dozens or hundreds of experiments need
to be run in a single day, Git creates overhead โ each experiment run requires
additional Git commands `git add/commit`, and comparing all experiments is
difficult.

We introduce lightweight experiments in DVC 2.0! This is how you can auto-track
ML experiments without any overhead from ML engineers.

โ?๏ธ Note, our new ML experiment features (`dvc exp`) are experimental in the
coming release. This means that the commands might change a bit in the following
minor releases.

`dvc exp run` can run an ML experiment with a new hyperparameter from
`params.yaml` while `dvc exp diff` shows metrics and params difference:

```dvc
$ dvc exp run --set-param featurize.max_features=3000

Reproduced experiment(s): exp-bb55c
Experiment results have been applied to your workspace.

$ dvc exp diff
Path         Metric    Value    Change
scores.json  auc       0.57462  0.0072197

Path         Param                   Value    Change
params.yaml  featurize.max_features  3000     1500
```

More experiments:

```dvc
$ dvc exp run --set-param featurize.max_features=4000
Reproduced experiment(s): exp-9bf22
Experiment results have been applied to your workspace.

$ dvc exp run --set-param featurize.max_features=5000
Reproduced experiment(s): exp-63ee0
Experiment results have been applied to your workspace.

$ dvc exp run --set-param featurize.max_features=5000 \
                --set-param featurize.ngrams=3
Reproduced experiment(s): exp-80655
Experiment results have been applied to your workspace.
```

In the examples above, hyperparameters were changed with the `--set-param`
option, but you can make these changes by modifying the params file instead. In
fact _any code or data files can be changed_ and `dvc exp run` will capture the
variations.

See all the runs:

```dvc
$ dvc exp show --no-pager --no-timestamp \
        --include-params featurize.max_features,featurize.ngrams
โโโโโโโโโโโโโโโโโณโโโโโโโโโโณโโโโโโโโโโโโโโโโโโโโโโโโโณโโโโโโโโโโโโโโโโโโโ
โ Experiment    โ     auc โ featurize.max_features โ featurize.ngrams โ
โกโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโฉ
โ workspace     โ 0.56359 โ 5000                   โ 3                โ
โ master        โ  0.5674 โ 1500                   โ 2                โ
โ โโโ exp-80655 โ 0.56359 โ 5000                   โ 3                โ
โ โโโ exp-63ee0 โ  0.5515 โ 5000                   โ 2                โ
โ โโโ exp-9bf22 โ 0.56448 โ 4000                   โ 2                โ
โ โโโ exp-bb55c โ 0.57462 โ 3000                   โ 2                โ
โโโโโโโโโโโโโโโโโดโโโโโโโโโโดโโโโโโโโโโโโโโโโโโโโโโโโโดโโโโโโโโโโโโโโโโโโโ
```

Under the hood, DVC uses Git to store the experiments' meta-information. A
straight-forward implementation would create visible branches and auto-commit in
them, but that approach would over-pollute the branch namespace very quickly. To
avoid this issue, we introduced custom Git references `exps`, the same way as
GitHub uses custom references `pulls` to track pull requests (this is an
interesting technical topic that deserves a separate blog post). Below you can
see how it works.

No artificial branches, only custom references `exps` (do not worry if you don't
understand this part - it is an implementation detail):

```dvc
$ git branch
* master

$ git show-ref
5649f62d845fdc29e28ea6f7672dd729d3946940 refs/exps/exec/EXEC_APPLY
5649f62d845fdc29e28ea6f7672dd729d3946940 refs/exps/exec/EXEC_BRANCH
5649f62d845fdc29e28ea6f7672dd729d3946940 refs/exps/71/67904d89e116f28daf7a6e4c0878268117c893/exp-80655
f16e7b7c804cf52d91d1d11850c15963fb2a8d7b refs/exps/97/d69af70c6fb4bc59aefb9a87437dcd28b3bde4/exp-63ee0
0566d42cddb3a8c4eb533f31027f0febccbbc2dd refs/exps/91/94265d5acd847e1c439dd859aa74b1fc3d73ad/exp-bb55c
9bb067559583990a8c5d499d7435c35a7c9417b7 refs/exps/49/5c835cd36772123e82e812d96eabcce320f7ec/exp-9bf22
```

The best experiment can be promoted to the workspace and committed to Git.

```dvc
$ dvc exp apply exp-bb55c
$ git add .
$ git commit -m 'optimize max feature size'
```

Alternatively, an experiment can be promoted to a branch (`big_fr_size` branch
in this case):

```dvc
$ dvc exp branch exp-80655 big_fr_size
Git branch 'big_fr_size' has been created from experiment 'exp-c695f'.
To switch to the new branch run:

	git checkout big_fr_size
```

Remove all the experiments that were not used:

```dvc
$ dvc exp gc --workspace --force
```

## Model checkpoints

ML model checkpoints are an essential part of deep learning. ML engineers prefer
to save the model files (or weights) at checkpoints during a training process
and return back when metrics start diverging or learning is not fast enough.

The checkpoints create a different dynamic around ML modeling process and need a
special support from the toolset:

1. Track and save model checkpoints (DVC outputs) periodically, not only the
   final result or training epoch.
2. Save metrics corresponding to each of the checkpoints.
3. Reuse checkpoints - warm-start training with an existing model file,
   corresponding code, dataset version and metrics.

This new behavior is supported in DVC 2.0. Now, DVC can version all your
checkpoints with corresponding code and data. It brings the reproducibility of
DL processes to the next level - every checkpoint is reproducible.

This is how you define checkpoints with live-metrics:

```dvc
$ dvc stage add -n train \
        -d users.csv -d train.py \
        -p dropout,epochs,lr,process \
        --checkpoint model.h5 \
        --live logs \
    python train.py

Creating 'dvc.yaml'
Adding stage 'train' in 'dvc.yaml'
```

Note, we use `dvc stage add` command instead of `dvc run`. Starting from DVC 2.0
we begin extracting all stage specific functionality under `dvc stage` umbrella.
`dvc run` is still working, but will be deprecated in the following major DVC
version (most likely in 3.0).

Start the training process and interrupt it after 5 epochs:

```dvc
$ dvc exp run
'users.csv.dvc' didn't change, skipping
Running stage 'train':
> python train.py
...
^CTraceback (most recent call last):
...
KeyboardInterrupt
```

Navigate in checkpoints:

```dvc
$ dvc exp show --no-pager --no-timestamp
โโโโโโโโโโโโโโโโโณโโโโโโโณโโโโโโโโโณโโโโโโโโโโโณโโโโโโโโโโโณโโโโณโโโโโโโโโณโโโโ
โ Experiment    โ step โ   loss โ accuracy โ val_loss โ โฆ โ epochs โ โฆ โ
โกโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโฉ
โ workspace     โ    4 โ 2.0702 โ  0.30388 โ    2.025 โ โฆ โ 5      โ โฆ โ
โ master        โ    - โ      - โ        - โ        - โ โฆ โ 5      โ โฆ โ
โ โ โ exp-e15bc โ    4 โ 2.0702 โ  0.30388 โ    2.025 โ โฆ โ 5      โ โฆ โ
โ โ โ 5ea8327   โ    4 โ 2.0702 โ  0.30388 โ    2.025 โ โฆ โ 5      โ โฆ โ
โ โ โ bc0cf02   โ    3 โ 2.1338 โ  0.23988 โ   2.0883 โ โฆ โ 5      โ โฆ โ
โ โ โ f8cf03f   โ    2 โ 2.1989 โ  0.17932 โ   2.1542 โ โฆ โ 5      โ โฆ โ
โ โ โ 7575a44   โ    1 โ 2.2694 โ  0.12833 โ    2.223 โ โฆ โ 5      โ โฆ โ
โ โโโจ a72c526   โ    0 โ 2.3416 โ   0.0959 โ   2.2955 โ โฆ โ 5      โ โฆ โ
โโโโโโโโโโโโโโโโโดโโโโโโโดโโโโโโโโโดโโโโโโโโโโโดโโโโโโโโโโโดโโโโดโโโโโโโโโดโโโโ
```

Each of the checkpoints above is a separate experiment with all data, code,
paramaters and metrics. You can use the same `dvc exp apply` command to extract
any of these.

Another run continues this process. You can see how accuracy metrics are
increasing - DVC does not remove the model/checkpoint and training code trains
on top of it:

```dvc
$ dvc exp run
Existing checkpoint experiment 'exp-e15bc' will be resumed
...
^C
KeyboardInterrupt

$ dvc exp show --no-pager --no-timestamp
โโโโโโโโโโโโโโโโโณโโโโโโโณโโโโโโโโโณโโโโโโโโโโโณโโโโโโโโโโโณโโโโณโโโโโโโโโณโโโโ
โ Experiment    โ step โ   loss โ accuracy โ val_loss โ โฆ โ epochs โ โฆ โ
โกโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโฉ
โ workspace     โ    9 โ 1.7845 โ  0.58125 โ   1.7381 โ โฆ โ 5      โ โฆ โ
โ master        โ    - โ      - โ        - โ        - โ โฆ โ 5      โ โฆ โ
โ โ โ exp-e15bc โ    9 โ 1.7845 โ  0.58125 โ   1.7381 โ โฆ โ 5      โ โฆ โ
โ โ โ 205a8d3   โ    9 โ 1.7845 โ  0.58125 โ   1.7381 โ โฆ โ 5      โ โฆ โ
โ โ โ dd23d96   โ    8 โ 1.8369 โ  0.54173 โ   1.7919 โ โฆ โ 5      โ โฆ โ
โ โ โ 5bb3a1f   โ    7 โ 1.8929 โ  0.49108 โ   1.8474 โ โฆ โ 5      โ โฆ โ
โ โ โ 6dc5610   โ    6 โ  1.951 โ  0.43433 โ   1.9046 โ โฆ โ 5      โ โฆ โ
โ โ โ a79cf29   โ    5 โ 2.0088 โ  0.36837 โ   1.9637 โ โฆ โ 5      โ โฆ โ
โ โ โ 5ea8327   โ    4 โ 2.0702 โ  0.30388 โ    2.025 โ โฆ โ 5      โ โฆ โ
โ โ โ bc0cf02   โ    3 โ 2.1338 โ  0.23988 โ   2.0883 โ โฆ โ 5      โ โฆ โ
โ โ โ f8cf03f   โ    2 โ 2.1989 โ  0.17932 โ   2.1542 โ โฆ โ 5      โ โฆ โ
โ โ โ 7575a44   โ    1 โ 2.2694 โ  0.12833 โ    2.223 โ โฆ โ 5      โ โฆ โ
โ โโโจ a72c526   โ    0 โ 2.3416 โ   0.0959 โ   2.2955 โ โฆ โ 5      โ โฆ โ
โโโโโโโโโโโโโโโโโดโโโโโโโดโโโโโโโโโดโโโโโโโโโโโดโโโโโโโโโโโดโโโโดโโโโโโโโโดโโโโ
```

After modifying the code, data, or params, the same process can be resumed. DVC
recognizes the change and shows it (see experiment `b363267`):

```dvc
$ vi train.py     # modify code
$ vi params.yaml  # modify params

$ dvc exp run
Modified checkpoint experiment based on 'exp-e15bc' will be created
...

$ dvc exp show --no-pager --no-timestamp
โโโโโโโโโโโโโโโโโโโโโโโโโณโโโโโโโณโโโโโโโโโณโโโโโโโโโโโณโโโโโโโโโโโณโโโโณโโโโโโโโโณโโโโ
โ Experiment            โ step โ   loss โ accuracy โ val_loss โ โฆ โ epochs โ โฆ โ
โกโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโโฉ
โ workspace             โ   13 โ 1.5841 โ  0.69262 โ   1.5381 โ โฆ โ 15     โ โฆ โ
โ master                โ    - โ      - โ        - โ        - โ โฆ โ 5      โ โฆ โ
โ โ โ exp-7ff06         โ   13 โ 1.5841 โ  0.69262 โ   1.5381 โ โฆ โ 15     โ โฆ โ
โ โ โ 6c62fec           โ   12 โ 1.6325 โ  0.67248 โ   1.5857 โ โฆ โ 15     โ โฆ โ
โ โ โ 4baca3c           โ   11 โ 1.6817 โ  0.64855 โ   1.6349 โ โฆ โ 15     โ โฆ โ
โ โ โ b363267 (2b06de7) โ   10 โ 1.7323 โ  0.61925 โ   1.6857 โ โฆ โ 15     โ โฆ โ
โ โ โ 2b06de7           โ    9 โ 1.7845 โ  0.58125 โ   1.7381 โ โฆ โ 5      โ โฆ โ
โ โ โ 205a8d3           โ    9 โ 1.7845 โ  0.58125 โ   1.7381 โ โฆ โ 5      โ โฆ โ
โ โ โ dd23d96           โ    8 โ 1.8369 โ  0.54173 โ   1.7919 โ โฆ โ 5      โ โฆ โ
โ โ โ 5bb3a1f           โ    7 โ 1.8929 โ  0.49108 โ   1.8474 โ โฆ โ 5      โ โฆ โ
โ โ โ 6dc5610           โ    6 โ  1.951 โ  0.43433 โ   1.9046 โ โฆ โ 5      โ โฆ โ
โ โ โ a79cf29           โ    5 โ 2.0088 โ  0.36837 โ   1.9637 โ โฆ โ 5      โ โฆ โ
โ โ โ 5ea8327           โ    4 โ 2.0702 โ  0.30388 โ    2.025 โ โฆ โ 5      โ โฆ โ
โ โ โ bc0cf02           โ    3 โ 2.1338 โ  0.23988 โ   2.0883 โ โฆ โ 5      โ โฆ โ
โ โ โ f8cf03f           โ    2 โ 2.1989 โ  0.17932 โ   2.1542 โ โฆ โ 5      โ โฆ โ
โ โ โ 7575a44           โ    1 โ 2.2694 โ  0.12833 โ    2.223 โ โฆ โ 5      โ โฆ โ
โ โโโจ a72c526           โ    0 โ 2.3416 โ   0.0959 โ   2.2955 โ โฆ โ 5      โ โฆ โ
โโโโโโโโโโโโโโโโโโโโโโโโโดโโโโโโโดโโโโโโโโโดโโโโโโโโโโโดโโโโโโโโโโโดโโโโดโโโโโโโโโดโโโโ
```

Sometimes you might need to train the model from scratch. The reset option
removes the checkpoint file before training: `dvc exp run --reset`.

## Metrics logging

Continuously logging ML metrics is a very common practice in the ML world.
Instead of a simple command-line output with the metrics values, many ML
engineers prefer visuals and plots. These plots can be organized in a "database"
of ML experiments to keep track of a project. There are many special solutions
for metrics collecting and experiment tracking such as sacred, mlflow, weight
and biases, neptune.ai, or others.

With DVC 2.0, we are releasing a new open-source library
[DVC-Live](https://github.com/iterative/dvclive) that provides functionality for
tracking model metrics and organizing metrics in simple text files in a way that
DVC can visualize the metrics with navigation in Git history. So, DVC can show
you a metrics difference between the current model and a model in `master` or
any other branch.

This approach is similar to the other metrics tracking tools with the difference
that Git becomes a "database" or of ML experiments.

### Generate metrics file

Install the library:

```dvc
$ pip install dvclive
```

Instrument your code:

```python
import dvclive
from dvclive.keras import DvcLiveCallback

dvclive.init("logs") #, summarize=True)

...

model.fit(...
          # Set up DVC-Live callback:
          callbacks=[ DvcLiveCallback() ]
         )

```

During the training you will see the metrics files that are continuously
populated each epochs:

```dvc
$ ls logs/
accuracy.tsv     loss.tsv         val_accuracy.tsv val_loss.tsv

$ head logs/accuracy.tsv
timestamp	step	accuracy
1613645582716	0	0.7360000014305115
1613645585478	1	0.8349999785423279
1613645587322	2	0.8830000162124634
1613645589125	3	0.9049999713897705
1613645590891	4	0.9070000052452087
1613645592681	5	0.9279999732971191
1613645594490	6	0.9430000185966492
1613645596232	7	0.9369999766349792
1613645598034	8	0.9430000185966492
```

In addition to the continuous metrics files, you will see the summary metrics
file and HTML file with the same file prefix. The summary file contains the
result of the latest epoch:

```dvc
$ cat logs.json | python -m json.tool
{
    "step": 41,
    "loss": 0.015958430245518684,
    "accuracy": 0.9950000047683716,
    "val_loss": 13.705962181091309,
    "val_accuracy": 0.5149999856948853
}
```

The HTML file contains all the visuals for continuous metrics as well as the
summary metrics on a single page:

![](/uploads/images/2021-02-18/dvclive-html.png)

Note, the HTML and the summary metrics files are generating automatically for
each. So, you can monitor model performance in realtime.

### Git-navigation with the metrics file

DVC repository is NOT required to use the live metrics functionality from the
above. It works independently from DVC.

DVC repository becomes useful when the metrics and plots are committed in your
Git repository, and you need navigation around the metrics.

Metrics difference between workspace and the last Git commit:

```dvc
$ git status -s
 M logs.json
 M logs/accuracy.tsv
 M logs/loss.tsv
 M logs/val_accuracy.tsv
 M logs/val_loss.tsv
 M train.py
?? model.h5

$ dvc metrics diff --target logs.json
Path       Metric        Old       New      Change
logs.json  accuracy      0.995     0.99     -0.005
logs.json  loss          0.01596   0.03036  0.0144
logs.json  step          41        36       -5
logs.json  val_accuracy  0.515     0.5175   0.0025
logs.json  val_loss      13.70596  3.29033  -10.41563
```

The difference between a particular commit/branch/tag or between two commits:

```dvc
$ dvc metrics diff --target logs.json HEAD^ 47b85c
Path       Metric        Old       New      Change
logs.json  accuracy      0.995     0.998    0.003
logs.json  loss          0.01596   0.01951  0.00355
logs.json  step          41        82       41
logs.json  val_accuracy  0.515     0.51     -0.005
logs.json  val_loss      13.70596  5.83056  -7.8754
```

The same Git-navigation works with the plots:

```dvc
$ dvc plots diff --target logs
file:///Users/dmitry/src/exp-dc/plots.html
```

![](/uploads/images/2021-02-18/dvclive-diff-html.png)

Another nice thing about the live metrics - they work across ML experiments and
checkpoints, if properly set up in dvc stages. To set up live metrics, you need
to specify the metrics directory in the `live` section of a stage:

```yaml
stages:
  train:
    cmd: python train.py
    live:
      logs:
        cache: false
        summary: true
        report: true
    deps:
      - data
```

## Thank you!

I'd like to thank all of you DVC community members for the feedback that we are
constantly getting. This feedback helps us build new functionalities in DVC and
make it more stable.

Please be in touch with us on [Twitter](https://twitter.com/DVCorg) and our
[Discord channel](https://dvc.org/chat).

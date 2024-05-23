# Generated by Django 5.0.3 on 2024-05-03 16:04

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="CategoryDefinition",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("category_en", models.CharField()),
                ("category_fr", models.CharField()),
                ("hash", models.CharField()),
            ],
        ),
        migrations.CreateModel(
            name="DamageTypeDefinition",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("damageType_en", models.CharField()),
                ("damageType_fr", models.CharField()),
                ("iconLink", models.CharField()),
                ("hash", models.CharField()),
            ],
        ),
        migrations.CreateModel(
            name="TierDefinition",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("tier_en", models.CharField()),
                ("tier_fr", models.CharField()),
                ("hash", models.CharField()),
            ],
        ),
        migrations.CreateModel(
            name="TypeDefinition",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("type_en", models.CharField()),
                ("type_fr", models.CharField()),
                ("hash", models.CharField()),
            ],
        ),
        migrations.CreateModel(
            name="Weapon",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("iconLink", models.CharField()),
                ("screenshotLink", models.CharField()),
                ("hash", models.CharField()),
                (
                    "category",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="d2guessrlib.categorydefinition",
                    ),
                ),
                (
                    "defaultDamageType",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="d2guessrlib.damagetypedefinition",
                    ),
                ),
                (
                    "tier",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="d2guessrlib.tierdefinition",
                    ),
                ),
                (
                    "type",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="d2guessrlib.typedefinition",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="WeaponDamageTypes",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "damageType",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="d2guessrlib.damagetypedefinition",
                    ),
                ),
                (
                    "weapon",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="_damageTypes",
                        to="d2guessrlib.weapon",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="WeaponFlavorText",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("flavorText_en", models.CharField()),
                ("flavorText_fr", models.CharField()),
                (
                    "weapon",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="_flavorText",
                        to="d2guessrlib.weapon",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="WeaponName",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name_en", models.CharField()),
                ("name_fr", models.CharField()),
                (
                    "weapon",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="_name",
                        to="d2guessrlib.weapon",
                    ),
                ),
            ],
        ),
    ]

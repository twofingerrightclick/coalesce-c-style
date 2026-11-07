namespace MyCompany.MyProject.Data.Test;

public class UnitTest1 : TestBase
{
    [Test]
    public async Task Test1()
    {
        // Arrange
        var widget1 = new Widget { Name = "Gnoam Sprecklesprocket", Category = WidgetCategory.Sprecklesprockets };
        Db.Add(widget1);
        Db.SaveChanges();

        RefreshServices();

        // Act
        var widget2 = Db.Widgets.Single();

        // Assert
        await Assert.That(widget2.Category).IsEqualTo(WidgetCategory.Sprecklesprockets);

        // After calling RefreshServices, we have a different DbContext instance
        // and so we'll get a different entity instance.
        await Assert.That(widget1).IsNotEqualTo(widget2);
    }

    [Test]
    public async Task SqliteCanFilterAndSortDatesAcrossContexts()
    {
        var earlier = new DateTimeOffset(2026, 1, 1, 10, 0, 0, TimeSpan.FromHours(2));
        var later = new DateTimeOffset(2026, 1, 1, 9, 0, 0, TimeSpan.Zero);
        Db.Widgets.AddRange(
            new Widget { Name = "Earlier", Category = WidgetCategory.Whizbangs, InventedOn = earlier },
            new Widget { Name = "Later", Category = WidgetCategory.Whizbangs, InventedOn = later },
            new Widget { Name = "Undated", Category = WidgetCategory.Whizbangs });
        Db.SaveChanges();

        RefreshServices();

        var widgets = Db.Widgets
            .Where(w => w.InventedOn >= earlier)
            .OrderBy(w => w.InventedOn)
            .ToList();
        await Assert.That(widgets.Select(w => w.Name).ToArray()).IsEquivalentTo(new[] { "Earlier", "Later" });
        await Assert.That(widgets[0].Name).IsEqualTo("Earlier");
        await Assert.That(widgets[0].InventedOn).IsEqualTo((DateTimeOffset?)earlier.ToUniversalTime());
        await Assert.That(Db.Widgets.Single(w => w.Name == "Undated").InventedOn).IsNull();
        await Assert.That(Db.AuditLogs.OrderBy(a => a.Date).ToList().Count > 0).IsTrue();
    }
}

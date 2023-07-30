using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Domain;
using Azure.Core;

namespace Application.Core
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            CreateMap<Activity, Activity>()
                .ForMember(x => x.Start,
                 opt => opt.MapFrom(src => TimeZoneInfo.ConvertTime(src.Start, TimeZoneInfo.Local)))
              .ForMember(x => x.End,
                  opt => opt.MapFrom(src => TimeZoneInfo.ConvertTime(src.End, TimeZoneInfo.Local)))
                .ForMember(x => x.Category, opt => opt.MapFrom<Category>(_ => null))
                .ForMember(x => x.Recurrence, opt => opt.MapFrom<Recurrence>(_ => null))
                .ForMember(x => x.Organization, opt => opt.MapFrom<Domain.Organization>(_ => null));              

            CreateMap<Recurrence, Recurrence>()
                 .ForMember(x => x.IntervalStart,
                  opt => opt.MapFrom(src => GetZeroTime(TimeZoneInfo.ConvertTime(src.IntervalStart, TimeZoneInfo.Local))))
                .ForMember(x => x.IntervalEnd,
                  opt => opt.MapFrom(src => GetElevenFiftyNine(TimeZoneInfo.ConvertTime(src.IntervalEnd, TimeZoneInfo.Local))));

              CreateMap<HostingReport, HostingReport>()
                .ForMember(x => x.Activity, opt => opt.MapFrom<Activity>(_ => null));

              CreateMap<EnlistedAideCheckList, EnlistedAideCheckList>()
                 .ForMember(x => x.Activity, opt => opt.MapFrom<Activity>(_ => null));

        }

        private DateTime GetZeroTime(DateTime date)
        {
            return new DateTime(date.Year, date.Month, date.Day, 0, 0, 0);
        }

        private DateTime GetElevenFiftyNine(DateTime date)
        {
            return new DateTime(date.Year, date.Month, date.Day, 23, 59, 59);
        }

    }
}
